import { addCommasToAmount } from "@/helpers/helpers";
import React from "react";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  data: {
    totalSales: string;
    numberOfBookings: string;
  };
}

const SalesStats = ({ data }: Props) => {
  const { t } = useLanguage();

  return (
    <div className="row my-5">
      <div className="col-12 col-lg-6">
        <div className="stats-card shadow-sm p-4 h-100">
          <div className="d-flex align-items-center">
            <div className="stats-icon-wrapper bg-sales shadow-sm me-4">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div>
              <p className="mb-1 text-muted fw-semibold text-uppercase small ls-wide">
                {t("admin.sale_stats")}
              </p>
              <h3 className="mb-0 fw-bold">
                {data && addCommasToAmount(data?.totalSales)}
              </h3>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-6 mt-4 mt-lg-0">
        <div className="stats-card shadow-sm p-4 h-100">
          <div className="d-flex align-items-center">
            <div className="stats-icon-wrapper bg-bookings shadow-sm me-4">
              <i className="fas fa-receipt"></i>
            </div>
            <div>
              <p className="mb-1 text-muted fw-semibold text-uppercase small ls-wide">
                {t("admin.bookings")}
              </p>
              <h3 className="mb-0 fw-bold">{data?.numberOfBookings}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesStats;
