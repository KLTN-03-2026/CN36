"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const AdminSidebar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { t } = useLanguage();


    const menuItem = [
        {
            name: t("admin.dashboard"),
            url: "/admin/dashboard",
            icon: "fas fa-tachometer-alt",
        },
        {
            name: t("admin.rooms"),
            url: "/admin/rooms",
            icon: "fas fa-hotel",
        },
        {
            name: t("admin.bookings"),
            url: "/admin/bookings",
            icon: "fas fa-receipt",
        },
        {
            name: t("admin.users"),
            url: "/admin/users",
            icon: "fas fa-user",
        },
        {
            name: t("admin.reviews"),
            url: "/admin/reviews",
            icon: "fas fa-star",
        },
    ];

    if (session?.user?.role === "admin") {
        menuItem.push({
            name: t("admin.logs"),
            url: "/admin/logs",
            icon: "fas fa-history",
        });
    }


    const [activeMenuItem, setActiveMenuItem] = useState(pathname);


    const handleMenuItemClick = (menuItem: string) => {
        setActiveMenuItem(menuItem);
    };

    return (
        <div className="list-group mt-5 pl-4">
            {menuItem.map((menuItem, index) => (
                <Link
                    key={index}
                    href={menuItem.url}
                    className={`fw-bold list-group-item list-group-item-action ${activeMenuItem === menuItem.url ? "active" : ""
                        }`}
                    onClick={() => handleMenuItemClick(menuItem.url)}
                    aria-current={activeMenuItem === menuItem.url ? "true" : "false"}
                >
                    <i className={`${menuItem.icon} fa-fw pe-2`}></i> {menuItem.name}
                </Link>
            ))}
        </div>
    );
};

export default AdminSidebar;
