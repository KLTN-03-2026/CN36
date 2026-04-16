"use client";

import { useGetAuditLogsQuery } from "@/redux/api/userApi";
import React, { useEffect } from "react";
import { toast } from "react-hot-toast";
import Loader from "../layout/Loader";
import dynamic from "next/dynamic";

const MDBDataTable = dynamic(
    () => import("mdbreact").then((mod) => mod.MDBDataTable),
    { ssr: false }
);

const AllLogs = () => {
  const { data, error, isLoading } = useGetAuditLogsQuery({});

  useEffect(() => {
    if (error && "data" in error) {
      toast.error(error?.data?.errMessage);
    }
  }, [error]);

  const setLogs = () => {
    const dataTable: { columns: any[]; rows: any[] } = {
      columns: [
        {
          label: "User",
          field: "user",
          sort: "asc",
        },
        {
          label: "Action",
          field: "action",
          sort: "asc",
        },
        {
          label: "Target",
          field: "target",
          sort: "asc",
        },
        {
          label: "Date",
          field: "date",
          sort: "asc",
        },
        {
          label: "Details",
          field: "details",
          sort: "asc",
        },
      ],
      rows: [],
    };

    data?.logs?.forEach((log: any) => {
      dataTable?.rows?.push({
        user: log.user?.name || "Deleted User",
        action: log.action,
        target: log.target,
        date: new Date(log.createdAt).toLocaleString(),
        details: log.details,
      });
    });

    return dataTable;
  };

  if (isLoading) return <Loader />;

  return (
    <div className="container">
      <h1 className="my-5">{`${data?.logs?.length || 0} Activity Logs`}</h1>
      <MDBDataTable
        data={setLogs()}
        className="px-3"
        bordered
        striped
        hover
      />
    </div>
  );
};

export default AllLogs;
