import json
import logging
from urllib.parse import quote

from app.core.email_templates import templates
from app.core.settings import app_settings
from app.schema.core import Application


def set_destionations(email: str):
    if app_settings.environment == "production":
        return email
    return app_settings.test_mail_receiver


def generate_common_data():
    return {
        "LINK-TO-WEB-VERSION": app_settings.frontend_url,
        "OCP_LOGO": app_settings.images_base_url + "/logoocp.jpg",
        "TWITTER_LOGO": app_settings.images_base_url + "/twiterlogo.png",
        "FB_LOGO": app_settings.images_base_url + "/facebook.png",
        "LINK_LOGO": app_settings.images_base_url + "/link.png",
        "TWITTER_LINK": app_settings.twitter_link,
        "FACEBOOK_LINK": app_settings.facebook_link,
        "LINK_LINK": app_settings.link_link,
    }


def get_images_base_url():
    # todo refactor required when this function receives the user language

    images_base_url = app_settings.images_base_url
    if app_settings.email_template_lang != "":
        images_base_url = f"{images_base_url}/{app_settings.email_template_lang}"

    return images_base_url


def send_application_approved_email(ses, application: Application):
    # todo refactor required when this function receives the user language

    images_base_url = get_images_base_url()

    data = {
        **generate_common_data(),
        "FI": application.lender.name,
        "AWARD_SUPPLIER_NAME": application.borrower.legal_name,
        "TENDER_TITLE": application.award.title,
        "BUYER_NAME": application.award.buyer_name,
        "UPLOAD_CONTRACT_URL": app_settings.frontend_url
        + "/application/"
        + quote(application.uuid)
        + "/upload-contract",
        "UPLOAD_CONTRACT_IMAGE_LINK": images_base_url + "/uploadContract.png",
    }

    destinations = set_destionations(application.primary_email)

    ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [destinations]},
        Template=templates[
            f"APPLICATION_APPROVED_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )


def send_mail_to_new_user(ses, name, username, temp_password):
    # todo refactor required when this function receives the user language

    images_base_url = get_images_base_url()

    data = {
        **generate_common_data(),
        "USER": name,
        "SET_PASSWORD_IMAGE_LINK": f"{images_base_url}/set_password.png",
        "LOGIN_URL": app_settings.frontend_url
        + "/create-password?key="
        + quote(temp_password)
        + "&email="
        + quote(username),
    }

    ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [username]},
        Template=templates[
            f"NEW_USER_TEMPLATE_NAME_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )


def send_upload_contract_notification_to_FI(ses, application):
    # todo refactor required when this function receives the user language
    images_base_url = get_images_base_url()

    data = {
        **generate_common_data(),
        "LOGIN_URL": app_settings.frontend_url + "/login",
        "LOGIN_IMAGE_LINK": images_base_url + "/logincompleteimage.png",
    }

    destinations = set_destionations(application.lender.email_group)

    ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [destinations]},
        Template=templates[
            f"NEW_CONTRACT_SUBMISSION_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )


def send_upload_contract_confirmation(ses, application):
    # todo refactor required when this function receives the user language
    data = {
        **generate_common_data(),
        "AWARD_SUPPLIER_NAME": application.borrower.legal_name,
        "TENDER_TITLE": application.award.title,
        "BUYER_NAME": application.award.buyer_name,
    }

    destinations = set_destionations(application.primary_email)

    ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [destinations]},
        Template=templates[
            f"CONTRACT_UPLOAD_CONFIRMATION_TEMPLATE_NAME_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )


def send_new_email_confirmation(
    ses,
    borrower_name: str,
    new_email: str,
    old_email: str,
    confirmation_email_token: str,
    application_uuid: str,
):
    images_base_url = get_images_base_url()
    CONFIRM_EMAIL_CHANGE_URL = (
        app_settings.frontend_url
        + "/application/"
        + quote(application_uuid)
        + "/change-primary-email?token="
        + quote(confirmation_email_token)
    )
    data = {
        **generate_common_data(),
        "NEW_MAIL": new_email,
        "AWARD_SUPPLIER_NAME": borrower_name,
        "CONFIRM_EMAIL_CHANGE_URL": CONFIRM_EMAIL_CHANGE_URL,
        "CONFIRM_EMAIL_CHANGE_IMAGE_LINK": images_base_url + "/confirmemailchange.png",
    }

    new_email_address = set_destionations(new_email)
    old_email_address = set_destionations(old_email)

    message = ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [new_email_address]},
        Template=templates[
            f"EMAIL_CHANGE_TEMPLATE_NAME_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )
    ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [old_email_address]},
        Template=templates[
            f"EMAIL_CHANGE_TEMPLATE_NAME_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )

    return message["MessageId"]


def send_mail_to_reset_password(ses, username: str, temp_password: str):
    images_base_url = get_images_base_url()

    data = {
        **generate_common_data(),
        "USER_ACCOUNT": username,
        "RESET_PASSWORD_URL": app_settings.frontend_url
        + "/create-password?key="
        + quote(temp_password)
        + "&email="
        + quote(username),
        "RESET_PASSWORD_IMAGE": images_base_url + "/ResetPassword.png",
    }

    ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [username]},
        Template=templates[
            f"RESET_PASSWORD_TEMPLATE_NAME_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )


def send_invitation_email(ses, uuid, email, borrower_name, buyer_name, tender_title):
    images_base_url = get_images_base_url()

    data = {
        **generate_common_data(),
        "AWARD_SUPPLIER_NAME": borrower_name,
        "TENDER_TITLE": tender_title,
        "BUYER_NAME": buyer_name,
        "FIND_OUT_MORE_IMAGE_LINK": images_base_url + "/findoutmore.png",
        "REMOVE_ME_IMAGE_LINK": images_base_url + "/removeme.png",
        "FIND_OUT_MORE_URL": app_settings.frontend_url
        + "/application/"
        + quote(uuid)
        + "/intro",
        "REMOVE_ME_URL": app_settings.frontend_url
        + "/application/"
        + quote(uuid)
        + "/decline",
    }

    destinations = set_destionations(email)

    response = ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [destinations]},
        Template=templates[
            f"ACCESS_TO_CREDIT_SCHEME_FOR_MSMES_TEMPLATE_NAME_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )
    return response.get("MessageId")


def send_mail_intro_reminder(ses, uuid, email, borrower_name, buyer_name, tender_title):
    images_base_url = get_images_base_url()
    data = {
        **generate_common_data(),
        "AWARD_SUPPLIER_NAME": borrower_name,
        "TENDER_TITLE": tender_title,
        "BUYER_NAME": buyer_name,
        "FIND_OUT_MORE_URL": app_settings.frontend_url
        + "/application/"
        + quote(uuid)
        + "/intro",
        "FIND_OUT_MORE_IMAGE_LINK": images_base_url + "/findoutmore.png",
        "REMOVE_ME_IMAGE_LINK": images_base_url + "/removeme.png",
        "REMOVE_ME_URL": app_settings.frontend_url
        + "/application/"
        + quote(uuid)
        + "/decline",
    }

    destinations = set_destionations(email)

    logging.info(
        f"{app_settings.environment} - Email to: {email} sent to {destinations}"
    )

    response = ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [destinations]},
        Template=templates[
            f"INTRO_REMINDER_TEMPLATE_NAME_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )
    message_id = response.get("MessageId")
    logging.info(message_id)
    return response.get("MessageId")


def send_mail_submit_reminder(
    ses, uuid, email, borrower_name, buyer_name, tender_title
):
    images_base_url = get_images_base_url()
    data = {
        **generate_common_data(),
        "AWARD_SUPPLIER_NAME": borrower_name,
        "TENDER_TITLE": tender_title,
        "BUYER_NAME": buyer_name,
        "APPLY_FOR_CREDIT_URL": app_settings.frontend_url
        + "/application/"
        + quote(uuid)
        + "/intro",
        "APPLY_FOR_CREDIT_IMAGE_LINK": images_base_url + "/applyForCredit.png",
        "REMOVE_ME_IMAGE_LINK": images_base_url + "/removeme.png",
        "REMOVE_ME_URL": app_settings.frontend_url
        + "/application/"
        + quote(uuid)
        + "/decline",
    }
    destinations = set_destionations(email)
    logging.info(
        f"{app_settings.environment} - Email to: {email} sent to {destinations}"
    )

    response = ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [destinations]},
        Template=templates[
            f"APPLICATION_REMINDER_TEMPLATE_NAME_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )
    message_id = response.get("MessageId")
    logging.info(message_id)
    return response.get("MessageId")


def send_notification_new_app_to_fi(ses, lender_email_group):
    # todo refactor required when this function receives the user language
    images_base_url = get_images_base_url()

    data = {
        **generate_common_data(),
        "LOGIN_URL": app_settings.frontend_url + "/login",
        "LOGIN_IMAGE_LINK": images_base_url + "/logincompleteimage.png",
    }

    ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [lender_email_group]},
        Template=templates[
            f"NEW_APPLICATION_SUBMISSION_FI_TEMPLATE_NAME_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )


def send_notification_new_app_to_ocp(ses, ocp_email_group, lender_name):
    # todo refactor required when this function receives the user language
    images_base_url = get_images_base_url()

    data = {
        **generate_common_data(),
        "FI": lender_name,
        "LOGIN_URL": app_settings.frontend_url + "/login",
        "LOGIN_IMAGE_LINK": images_base_url + "/logincompleteimage.png",
    }

    ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [ocp_email_group]},
        Template=templates[
            f"NEW_APPLICATION_SUBMISSION_OCP_TEMPLATE_NAME_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )


def send_mail_request_to_sme(ses, uuid, lender_name, email_message, sme_email):
    # todo refactor required when this function receives the user language
    images_base_url = get_images_base_url()

    data = {
        **generate_common_data(),
        "FI": lender_name,
        "FI_MESSAGE": email_message,
        "LOGIN_DOCUMENTS_URL": app_settings.frontend_url
        + "/application/"
        + quote(uuid)
        + "/documents",
        "LOGIN_IMAGE_LINK": images_base_url + "/uploadDocument.png",
    }

    destinations = set_destionations(sme_email)

    response = ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [destinations]},
        Template=templates[
            f"REQUEST_SME_DATA_TEMPLATE_NAME_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )
    return response.get("MessageId")


def send_overdue_application_email_to_FI(ses, name: str, email: str, amount: int):
    # todo refactor required when this function receives the user language
    images_base_url = get_images_base_url()

    data = {
        **generate_common_data(),
        "USER": name,
        "NUMBER_APPLICATIONS": amount,
        "LOGIN_IMAGE_LINK": images_base_url + "/logincompleteimage.png",
        "LOGIN_URL": app_settings.frontend_url + "/login",
    }

    destinations = set_destionations(email)

    response = ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [destinations]},
        Template=templates[
            f"OVERDUE_APPLICATION_FI_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )
    return response.get("MessageId")


def send_overdue_application_email_to_OCP(ses, name: str):
    # todo refactor required when this function receives the user language
    images_base_url = get_images_base_url()

    data = {
        **generate_common_data(),
        "USER": name,
        "FI": name,
        "LOGIN_IMAGE_LINK": images_base_url + "/logincompleteimage.png",
        "LOGIN_URL": app_settings.frontend_url + "/login",
    }

    response = ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [app_settings.ocp_email_group]},
        Template=templates[
            f"OVERDUE_APPLICATION_OCP_ADMIN_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )
    return response.get("MessageId")


def send_rejected_application_email(ses, application):
    # todo refactor required when this function receives the user language
    images_base_url = get_images_base_url()

    data = {
        **generate_common_data(),
        "FI": application.lender.name,
        "AWARD_SUPPLIER_NAME": application.borrower.legal_name,
        "FIND_ALTENATIVE_URL": app_settings.frontend_url
        + f"/application/{quote(application.uuid)}/find-alternative-credit",
        "FIND_ALTERNATIVE_IMAGE_LINK": images_base_url + "/findAlternative.png",
    }
    destinations = set_destionations(application.primary_email)

    response = ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [destinations]},
        Template=templates[
            f"APPLICATION_DECLINED_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )
    return response.get("MessageId")


def send_rejected_application_email_without_alternatives(ses, application):
    # todo refactor required when this function receives the user language

    data = {
        **generate_common_data(),
        "FI": application.lender.name,
        "AWARD_SUPPLIER_NAME": application.borrower.legal_name,
    }
    destinations = set_destionations(application.primary_email)

    response = ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [destinations]},
        Template=templates[
            f"APPLICATION_DECLINED_WITHOUT_ALTERNATIVE_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )
    return response.get("MessageId")


def send_copied_application_notification_to_sme(ses, application):
    # todo refactor required when this function receives the user language
    images_base_url = get_images_base_url()
    data = {
        **generate_common_data(),
        "AWARD_SUPPLIER_NAME": application.borrower.legal_name,
        "CONTINUE_IMAGE_LINK": images_base_url + "/continueInCredere.png",
        "CONTINUE_URL": app_settings.frontend_url
        + "/application/"
        + application.uuid
        + "/credit-options",
    }

    destinations = set_destionations(application.primary_email)

    response = ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [destinations]},
        Template=templates[
            f"ALTERNATIVE_CREDIT_OPTION_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )
    return response.get("MessageId")


def send_upload_documents_notifications_to_FI(ses, email: str):
    # todo refactor required when this function receives the user language
    images_base_url = get_images_base_url()
    data = {
        **generate_common_data(),
        "LOGIN_IMAGE_LINK": images_base_url + "/logincompleteimage.png",
        "LOGIN_URL": app_settings.frontend_url + "/login",
    }

    destinations = set_destionations(email)

    response = ses.send_templated_email(
        Source=app_settings.email_sender_address,
        Destination={"ToAddresses": [destinations]},
        Template=templates[
            f"APPLICATION_UPDATE_{app_settings.email_template_lang.upper()}"
        ],
        TemplateData=json.dumps(data),
    )
    return response.get("MessageId")
