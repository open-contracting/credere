import os
from unittest.mock import patch

from fastapi import status

from app import models, util
from app.i18n import _
from app.settings import app_settings
from tests import BASEDIR, MockResponse, assert_ok, load_json_file


def test_reject_application(client, session, lender_header, pending_application):
    appid = pending_application.id
    payload = {
        "compliance_checks_failed": True,
        "poor_credit_history": True,
        "risk_of_fraud": False,
        "other": True,
        "other_reason": "test rejection message",
    }

    # tries to reject the application before its started
    response = client.post(f"/applications/{appid}/reject-application", json=payload, headers=lender_header)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json() == {"detail": _("Application status should not be %(status)s", status=_("PENDING"))}

    pending_application.status = models.ApplicationStatus.STARTED
    session.commit()

    response = client.post(f"/applications/{appid}/reject-application", json=payload, headers=lender_header)
    assert_ok(response)
    assert response.json()["status"] == models.ApplicationStatus.REJECTED

    response = client.post("/applications/find-alternative-credit-option", json={"uuid": pending_application.uuid})
    assert_ok(response)


def test_approve_application_cycle(
    reset_database, client, session, admin_header, lender_header, unauthorized_lender_header, pending_application
):
    appid = pending_application.id
    source_award = load_json_file("fixtures/award.json")
    new_email = "newtestemail@gmail.com"
    file = os.path.join(BASEDIR, "fixtures", "file.jpeg")
    award_payload = {"title": "new test title"}
    borrower_payload = {"legal_name": "new_legal_name"}
    approve_payload = {
        "compliant_checks_completed": True,
        "compliant_checks_passed": True,
        "disbursed_final_amount": 10000,
    }

    # this will mock the previous award get to return an empty array
    with (
        patch(
            "app.sources.colombia.get_previous_awards",
            return_value=MockResponse(status.HTTP_200_OK, source_award),
        ),
        patch(
            "app.sources.colombia._get_remote_contract",
            return_value=(load_json_file("fixtures/contract.json"), "url"),
        ),
    ):
        response = client.post("/applications/access-scheme", json={"uuid": pending_application.uuid})
        assert_ok(response)
        assert response.json()["application"]["status"] == models.ApplicationStatus.ACCEPTED

        # Application should be accepted now so it cannot be accepted again
        response = client.post("/applications/access-scheme", json={"uuid": pending_application.uuid})
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert response.json() == {"detail": _("Application status should not be %(status)s", status=_("ACCEPTED"))}

    response = client.post(
        "/applications/credit-product-options",
        json={
            "uuid": pending_application.uuid,
            "borrower_size": models.BorrowerSize.SMALL,
            "amount_requested": 10000,
        },
    )
    assert_ok(response)

    response = client.post(
        "/applications/select-credit-product",
        json={
            "uuid": pending_application.uuid,
            "borrower_size": models.BorrowerSize.SMALL,
            "amount_requested": 10000,
            "sector": "adminstration",
            "credit_product_id": pending_application.credit_product_id,
        },
    )
    assert_ok(response)

    response = client.post("/applications/confirm-credit-product", json={"uuid": pending_application.uuid})
    assert_ok(response)

    # Lender user tries to fetch previous awards
    response = client.get(f"/applications/{appid}/previous-awards", headers=lender_header)
    assert_ok(response)
    assert len(response.json()) == len(source_award)
    assert response.json()[0]["previous"] is True
    assert response.json()[0]["entity_code"] == source_award[0]["nit_entidad"]

    # different lender user tries to fetch previous awards
    response = client.get(f"/applications/{appid}/previous-awards", headers=unauthorized_lender_header)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {"detail": _("User is not authorized")}

    # different lender tries to get the application
    response = client.get(f"/applications/id/{appid}", headers=unauthorized_lender_header)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {"detail": _("User is not authorized")}

    # borrower tries to change their email to a non valid one
    response = client.post(
        "/applications/change-email",
        json={"uuid": pending_application.uuid, "new_email": "wrong_email@@noreply!$%&/().open-contracting.org"},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json() == {"detail": _("New email is not valid")}

    response = client.post(
        "/applications/change-email", json={"uuid": pending_application.uuid, "new_email": new_email}
    )
    assert_ok(response)

    response = client.post(
        "/applications/change-email", json={"uuid": pending_application.uuid, "new_email": new_email}
    )
    assert_ok(response)

    confirmation_email_token = util.generate_uuid(new_email)

    response = client.post(
        "/applications/confirm-change-email",
        json={"uuid": pending_application.uuid, "confirmation_email_token": confirmation_email_token},
    )
    assert_ok(response)

    # borrower tries to confirm email without a pending change
    response = client.post(
        "/applications/confirm-change-email",
        json={"uuid": pending_application.uuid, "confirmation_email_token": "confirmation_email_token"},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json() == {"detail": _("Application is not pending an email confirmation")}

    response = client.post("/applications/submit", json={"uuid": pending_application.uuid})
    assert_ok(response)
    assert response.json()["application"]["status"] == models.ApplicationStatus.SUBMITTED

    # tries to upload document before application starting
    with open(file, "rb") as file_to_upload:
        response = client.post(
            "/applications/upload-document",
            data={"uuid": pending_application.uuid, "type": models.BorrowerDocumentType.INCORPORATION_DOCUMENT},
            files={"file": (file_to_upload.name, file_to_upload, "image/jpeg")},
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert response.json() == {"detail": _("Application status should not be %(status)s", status=_("SUBMITTED"))}

    # borrower tries to access a non-existing external onboarding system
    response = client.get(f"/applications/uuid/{pending_application.uuid}/access-external-onboarding")
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json() == {"detail": _("The lender has no external onboarding URL")}

    # borrower tries to access a non-existing external onboarding system
    response = client.get(f"/applications/uuid/{pending_application.uuid}/accessed-external-onboarding")
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json() == {"detail": _("The lender has no external onboarding URL")}

    # different lender user tries to start the application
    response = client.post(f"/applications/{appid}/start", headers=unauthorized_lender_header)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {"detail": _("User is not authorized")}

    # different lender user tries to update the award
    response = client.put(f"/applications/{appid}/award", json=award_payload, headers=unauthorized_lender_header)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {"detail": _("User is not authorized")}

    # different lender user tries to update the borrower
    response = client.put(f"/applications/{appid}/borrower", json=borrower_payload, headers=unauthorized_lender_header)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {"detail": _("User is not authorized")}

    # The lender user starts application
    response = client.post(f"/applications/{appid}/start", headers=lender_header)
    assert_ok(response)
    assert response.json()["status"] == models.ApplicationStatus.STARTED

    # different lender user tries to update the award
    response = client.put(f"/applications/{appid}/award", json=award_payload, headers=unauthorized_lender_header)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {"detail": _("User is not authorized")}

    # different lender user tries to update the borrower
    response = client.put(f"/applications/{appid}/borrower", json=borrower_payload, headers=unauthorized_lender_header)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {"detail": _("User is not authorized")}

    # Lender user tries to update non existing award
    response = client.put("/applications/999/award", json=award_payload, headers=lender_header)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {"detail": _("Application not found")}

    # Lender user tries to update non existing borrower
    response = client.put("/applications/999/borrower", json=borrower_payload, headers=lender_header)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {"detail": _("Application not found")}

    # Lender user tries to update the award
    response = client.put(f"/applications/{appid}/award", json=award_payload, headers=lender_header)
    assert_ok(response)
    assert response.json()["award"]["title"] == award_payload["title"]

    # Lender user tries to update the borrower
    response = client.put(f"/applications/{appid}/borrower", json=borrower_payload, headers=lender_header)
    assert_ok(response)
    assert response.json()["borrower"]["legal_name"] == borrower_payload["legal_name"]

    response = client.post(f"applications/email-sme/{appid}", json={"message": "test message"}, headers=lender_header)
    assert_ok(response)
    assert response.json()["status"] == models.ApplicationStatus.INFORMATION_REQUESTED

    # borrower uploads the wrong type of document
    with open(os.path.join(BASEDIR, "fixtures", "file.gif"), "rb") as file_to_upload:
        response = client.post(
            "/applications/upload-document",
            data={"uuid": pending_application.uuid, "type": models.BorrowerDocumentType.INCORPORATION_DOCUMENT},
            files={"file": (file_to_upload.name, file_to_upload, "image/jpeg")},
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert response.json() == {"detail": _("Format not allowed. It must be a PNG, JPEG, PDF or ZIP file")}

    with open(file, "rb") as file_to_upload:
        response = client.post(
            "/applications/upload-document",
            data={"uuid": pending_application.uuid, "type": models.BorrowerDocumentType.INCORPORATION_DOCUMENT},
            files={"file": (file_to_upload.name, file_to_upload, "image/jpeg")},
        )
        assert_ok(response)

        response = client.post("/applications/complete-information-request", json={"uuid": pending_application.uuid})
        assert_ok(response)
        assert response.json()["application"]["status"] == models.ApplicationStatus.STARTED

        response = client.get(f"/applications/documents/id/{appid}", headers=lender_header)
        assert_ok(response)

        # OCP user downloads the document
        response = client.get(f"/applications/documents/id/{appid}", headers=admin_header)
        assert_ok(response)

        # OCP ask for a file that does not exist
        response = client.get("/applications/documents/id/999", headers=admin_header)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json() == {"detail": _("%(model_name)s not found", model_name="BorrowerDocument")}

    # lender tries to approve the application without verifying legal_name
    response = client.post(f"/applications/{appid}/approve-application", json=approve_payload, headers=lender_header)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json() == {"detail": _("Some borrower data field are not verified")}

    # verify legal_name
    response = client.put(f"/applications/{appid}/verify-data-field", json={"legal_name": True}, headers=lender_header)
    assert_ok(response)
    assert response.json()["secop_data_verification"] == {
        "legal_name": True,
        "address": True,
        "email": True,
        "legal_identifier": True,
        "sector": True,
        "size": True,
        "type": True,
    }

    # lender tries to approve the application without verifying INCORPORATION_DOCUMENT
    response = client.post(f"/applications/{appid}/approve-application", json=approve_payload, headers=lender_header)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json() == {"detail": _("Some documents are not verified")}

    # verify borrower document
    response = client.put(
        f"/applications/documents/{appid}/verify-document", json={"verified": True}, headers=lender_header
    )
    assert_ok(response)
    assert response.json()["id"] == 1
    assert session.query(models.BorrowerDocument).one().verified is True

    # lender approves application
    response = client.post(f"/applications/{appid}/approve-application", json=approve_payload, headers=lender_header)
    assert_ok(response)
    assert response.json()["status"] == models.ApplicationStatus.APPROVED


def test_approve_application_with_external_onboarding(
    reset_database, client, session, lender_header, accepted_application, lender
):
    appid = accepted_application.id

    lender.external_onboarding_url = "https://example.com"
    session.commit()

    client.post(
        "/applications/select-credit-product",
        json={
            "uuid": accepted_application.uuid,
            "borrower_size": models.BorrowerSize.SMALL,
            "amount_requested": 10000,
            "sector": "adminstration",
            "credit_product_id": accepted_application.credit_product_id,
        },
    )
    client.post("/applications/confirm-credit-product", json={"uuid": accepted_application.uuid})
    client.post("/applications/submit", json={"uuid": accepted_application.uuid})

    # borrower access external onboarding system
    # We must set follow_redirects=False https://github.com/fastapi/fastapi/issues/790
    response = client.get(
        f"/applications/uuid/{accepted_application.uuid}/access-external-onboarding", follow_redirects=False
    )
    assert response.status_code == status.HTTP_303_SEE_OTHER
    assert response.headers["location"] == lender.external_onboarding_url

    # borrower access external onboarding system again
    response = client.get(
        f"/applications/uuid/{accepted_application.uuid}/access-external-onboarding", follow_redirects=False
    )
    assert response.status_code == status.HTTP_303_SEE_OTHER
    assert response.headers["location"] == (
        f"{app_settings.frontend_url}/application/{accepted_application.uuid}/external-onboarding-completed"
    )

    # borrower indicates that it has accessed external onboarding system
    response = client.get(
        f"/applications/uuid/{accepted_application.uuid}/accessed-external-onboarding", follow_redirects=False
    )
    assert response.status_code == status.HTTP_303_SEE_OTHER
    assert response.headers["location"] == (
        f"{app_settings.frontend_url}/application/{accepted_application.uuid}/external-onboarding-completed"
    )

    # The lender user starts application
    response = client.post(f"/applications/{appid}/start", headers=lender_header)
    assert_ok(response)
    assert response.json()["status"] == models.ApplicationStatus.STARTED

    # lender tries to approve the application without verifying fields and documents and final amount
    payload = {"compliant_checks_completed": True, "compliant_checks_passed": True, "disbursed_final_amount": 0}
    response = client.post(f"/applications/{appid}/approve-application", json=payload, headers=lender_header)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert isinstance(response.json()["detail"], list)  # Pydantic errors are lists of dicts, not str

    # disbursed_final_amount is set, but documents and fields verifications are not required
    payload["disbursed_final_amount"] = 1000
    response = client.post(f"/applications/{appid}/approve-application", json=payload, headers=lender_header)
    assert_ok(response)
    assert response.json()["status"] == models.ApplicationStatus.APPROVED


def test_get_applications(client, session, admin_header, lender_header, pending_application):
    appid = pending_application.id

    response = client.get(
        "/applications/admin-list/?page=1&page_size=4&sort_field=borrower.legal_name&sort_order=asc",
        headers=admin_header,
    )
    assert_ok(response)

    response = client.get("/applications/admin-list/?page=1&page_size=4&sort_field=borrower.legal_name&sort_order=asc")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    # This error is from a fastapi.security module and therefore isn't translated.
    assert response.json() == {"detail": "Not authenticated"}

    response = client.get(f"/applications/id/{appid}", headers=admin_header)
    assert_ok(response)

    response = client.get(f"/applications/id/{appid}", headers=lender_header)
    assert_ok(response)

    response = client.get(f"/applications/id/{appid}")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {"detail": "Not authenticated"}

    # tries to get a non existing application
    response = client.get("/applications/id/999", headers=lender_header)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {"detail": _("Application not found")}

    response = client.get("/applications", headers=lender_header)
    assert_ok(response)

    response = client.get("/applications")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {"detail": "Not authenticated"}

    response = client.get(f"/applications/uuid/{pending_application.uuid}")
    assert_ok(response)

    pending_application.status = models.ApplicationStatus.LAPSED
    session.commit()

    response = client.get(f"/applications/uuid/{pending_application.uuid}")
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json() == {"detail": _("Application lapsed")}

    response = client.get("/applications/uuid/123-456")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {"detail": _("Application not found")}

    response = client.post("/applications/access-scheme", json={"uuid": "123-456"})
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {"detail": _("Application not found")}


def test_lapse_application(client, session, lender_header, pending_application):
    response = client.post(f"/applications/{pending_application.id}/lapse", headers=lender_header)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert response.json() == {"detail": _("Application status should not be %(status)s", status=_("PENDING"))}

    pending_application.status = models.ApplicationStatus.STARTED
    session.commit()

    response = client.post(f"/applications/{pending_application.id}/lapse", headers=lender_header)
    assert_ok(response)
    assert response.json()["status"] == models.ApplicationStatus.LAPSED
