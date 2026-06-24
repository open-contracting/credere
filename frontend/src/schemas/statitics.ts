export type ChartData = {
  name: string;
  value: number;
};

interface StatisticsKpis {
  applications_received_count: number;
  applications_approved_count: number;
  applications_rejected_count: number;
  applications_waiting_for_information_count: number;
  applications_in_progress_count: number;
  applications_with_credit_disbursed_count: number;
  proportion_of_disbursed: number;
  average_amount_requested: number;
  average_repayment_period: number;
  applications_overdue_count: number;
  average_processing_time: number;
  proportion_of_submitted_out_of_opt_in: number;
}

interface OptInStat {
  unique_businesses_contacted_by_credere: number;
  unique_smes_contacted_by_credere: number;
  applications_created: number;
  accepted_count_unique: number;
  accepted_percentage: number;
  msme_accepted_count_woman: number;
  msme_approved_count_woman: number;
  approved_count_distinct_micro: number;
  accepted_count: number;
  approved_count: number;
  msme_approved_count: number;
  approved_count_distinct_micro_woman: number;
  msme_submitted_count_woman: number;
  total_credit_disbursed_micro: number;
  msme_total_credit_disbursed: number;
  sector_statistics: ChartData[];
  rejected_reasons_count_by_reason: ChartData[];
  fis_chosen_by_supplier: ChartData[];
  average_credit_disbursed: number;
  msme_accepted_count_distinct: number;
  msme_submitted_count_distinct: number;
  msme_approved_count_distinct: number;
  average_applications_per_day: number;
  total_credit_disbursed: number;
}

export interface StatisticsFI {
  statistics_kpis: StatisticsKpis;
}

export interface StatisticsOCPoptIn {
  opt_in_stat: OptInStat;
}

export interface StatisticsParmsInput {
  custom_range?: string;
  initial_date?: string;
  final_date?: string;
  lender_id?: number;
}
