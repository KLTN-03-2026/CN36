"use client";

import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SalesStats from "./SalesStats";
import { SalesChart } from "../charts/SalesCharts";
import { TopPerformingChart } from "../charts/TopPerformingChart";
import { useLazyGetSalesStatsQuery } from "@/redux/api/bookingApi";
import { toast } from "react-hot-toast";
import Loading from "@/app/admin/loading";

import { useLanguage } from "../../context/LanguageContext";

const Dashboard = () => {
    const { t } = useLanguage();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [getSalesStats, { error, data, isLoading }] =
        useLazyGetSalesStatsQuery();

    useEffect(() => {
        if (error && "data" in error) {
            toast.error(error?.data?.message);
        }

        if (startDate && endDate && !data) {
            getSalesStats({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });
        }
    }, [error]);

    const submitHandler = () => {
        getSalesStats({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        });
    };

    if (!data) return <Loading />;

    return (
        <div className="ps-4 my-5 card-body">
            <div className="d-flex justify-content-start align-items-center mb-5 bg-white p-4 shadow-sm rounded-4">
                <div className="me-4 border-end pe-4">
                    <label className="form-label d-block text-muted small text-uppercase ls-wide">
                        {t("admin.start_date")}
                    </label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date: any) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        className="form-control border-0 bg-light"
                    />
                </div>
                <div className="me-4 border-end pe-4">
                    <label className="form-label d-block text-muted small text-uppercase ls-wide">
                        {t("admin.end_date")}
                    </label>
                    <DatePicker
                        selected={endDate}
                        onChange={(date: any) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        className="form-control border-0 bg-light"
                    />
                </div>

                <button
                    className="btn btn-primary px-5 py-2 fw-bold"
                    onClick={submitHandler}
                >
                    {t("common.fetch_data")}
                </button>
            </div>

            <SalesStats data={data} />

            <div className="row g-4 mt-4">
                <div className="col-12 col-lg-8">
                    <div className="table-container h-100">
                        <h4 className="mb-4 fw-bold">{t("admin.sale_stats")}</h4>
                        <SalesChart salesData={data?.sixMonthSalesData} />
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="table-container h-100 text-center">
                        <h4 className="mb-4 fw-bold">{t("admin.top_performing")}</h4>
                        {data?.topRooms?.length > 0 ? (
                            <TopPerformingChart rooms={data?.topRooms} />
                        ) : (
                            <div className="d-flex align-items-center justify-content-center h-75">
                                <p className="text-muted italic">
                                    {t("common.no_data")}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};



export default Dashboard;