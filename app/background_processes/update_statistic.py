import logging
from contextlib import contextmanager
from datetime import datetime

from sqlalchemy import Date, cast

from app.db.session import get_db
from app.schema import core
from app.schema.statistic import Statistic, StatisticType

from . import statistics_utils

# any
get_statistics_kpis = statistics_utils.get_general_statistics
# OCP
get_msme_opt_in = statistics_utils.get_msme_opt_in_stats


def update_statistics():
    with contextmanager(get_db)() as session:
        try:
            # Get general Kpis
            statistic_kpis = get_statistics_kpis(session, None, None, None)
            # Try to get the existing row
            statistic_kpi_data = (
                session.query(Statistic)
                .filter(
                    cast(Statistic.created_at, Date) == datetime.today().date(),
                    Statistic.type == StatisticType.APPLICATION_KPIS,
                )
                .first()
            )

            # If it exists, update it
            if statistic_kpi_data:
                statistic_kpi_data.data = statistic_kpis
            # If it doesn't exist, create a new one
            else:
                statistic_kpi_data = Statistic(
                    type=StatisticType.APPLICATION_KPIS,
                    data=statistic_kpis,
                    created_at=datetime.now(),
                )
                session.add(statistic_kpi_data)

            # Get Opt in statistics
            statistics_msme_opt_in = get_msme_opt_in(session)
            statistics_msme_opt_in["sector_statistics"] = [
                data.dict() for data in statistics_msme_opt_in["sector_statistics"]
            ]
            statistics_msme_opt_in["rejected_reasons_count_by_reason"] = [
                data.dict()
                for data in statistics_msme_opt_in["rejected_reasons_count_by_reason"]
            ]
            statistics_msme_opt_in["fis_choosen_by_msme"] = [
                data.dict() for data in statistics_msme_opt_in["fis_choosen_by_msme"]
            ]
            # Try to get the existing row
            statistic_opt_data = (
                session.query(Statistic)
                .filter(
                    cast(Statistic.created_at, Date) == datetime.today().date(),
                    Statistic.type == StatisticType.MSME_OPT_IN_STATISTICS,
                )
                .first()
            )

            # If it exists, update it
            if statistic_opt_data:
                statistic_opt_data.data = statistics_msme_opt_in
            # If it doesn't exist, create a new one
            else:
                statistic_opt_data = Statistic(
                    type=StatisticType.MSME_OPT_IN_STATISTICS,
                    data=statistics_msme_opt_in,
                    created_at=datetime.now(),
                )
                session.add(statistic_opt_data)

            # Get general Kpis for every lender
            lender_ids = [id[0] for id in session.query(core.Lender.id).all()]
            print(lender_ids)

            for lender_id in lender_ids:
                # Get statistics for each lender
                statistic_kpis = get_statistics_kpis(session, None, None, lender_id)

                # Try to get the existing row
                statistic_kpi_data = (
                    session.query(Statistic)
                    .filter(
                        cast(Statistic.created_at, Date) == datetime.today().date(),
                        Statistic.type == StatisticType.APPLICATION_KPIS,
                        Statistic.lender_id == lender_id,
                    )
                    .first()
                )

                # If it exists, update it
                if statistic_kpi_data:
                    statistic_kpi_data.data = statistic_kpis
                # If it doesn't exist, create a new one
                else:
                    statistic_kpi_data = Statistic(
                        type=StatisticType.APPLICATION_KPIS,
                        data=statistic_kpis,
                        lender_id=lender_id,
                        created_at=datetime.now(),
                    )

                session.add(statistic_kpi_data)

            session.commit()

        except Exception as e:
            logging.error(f"there was an error saving statistics: {e}")
            session.rollback()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
        handlers=[logging.StreamHandler()],  # Output logs to the console
    )
    update_statistics()
