from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Column, DateTime
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql import func
from sqlmodel import Field, SQLModel


class StatisticType(Enum):
    MSME_OPT_IN_STATISTICS = "MSME_OPT_IN_STATISTICS"
    APPLICATION_KPIS = "APPLICATION_KPIS"


class StatisticCustomRange(Enum):
    LAST_WEEK = "LAST_WEEK"
    LAST_MONTH = "LAST_MONTH"


class Statistic(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: StatisticType = Field(sa_column=Column(SAEnum(StatisticType, name="statistic_type")))
    data: dict = Field(default={}, sa_column=Column(JSON))
    created_at: Optional[datetime] = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False, onupdate=func.now())
    )
    lender_id: Optional[int] = Field(foreign_key="lender.id", nullable=True)
