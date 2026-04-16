"use client";

import { IUser } from "@/backend/models/user";
import { useDeleteUserMutation } from "@/redux/api/userApi";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "react-hot-toast";

import dynamic from "next/dynamic";
const MDBDataTable = dynamic(
    () => import("mdbreact").then((mod) => mod.MDBDataTable),
    { ssr: false }
);

interface Props {
    data: {
        users: IUser[];
    };
}

const AllUsers = ({ data }: Props) => {
    const users = data?.users;
    const router = useRouter();
    const { data: session } = useSession();

    const [deleteUser, { error, isSuccess, isLoading }] = useDeleteUserMutation();

    useEffect(() => {
        if (error && "data" in error) {
            toast.error(error?.data?.errMessage);
        }

        if (isSuccess) {
            router.refresh();
            toast.success("User deleted");
        }
    }, [error, isSuccess]);

    const setUsers = () => {
        const data: { columns: any[]; rows: any[] } = {
            columns: [
                {
                    label: "ID",
                    field: "id",
                    sort: "asc",
                },
                {
                    label: "Name",
                    field: "name",
                    sort: "asc",
                },
                {
                    label: "Email",
                    field: "email",
                    sort: "asc",
                },
                {
                    label: "Role",
                    field: "role",
                    sort: "asc",
                },
                {
                    label: "Actions",
                    field: "actions",
                    sort: "asc",
                },
            ],
            rows: [],
        };

        users?.forEach((user) => {
            data?.rows?.push({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                actions: (
                    <>
                        <Link
                            href={`/admin/users/${user._id}`}
                            className="btn btn-outline-primary"
                        >
                            {" "}
                            <i className="fa fa-pencil"></i>{" "}
                        </Link>
                        {session?.user?.role === "admin" && (
                            <button
                                className="btn btn-outline-danger ms-2"
                                onClick={() => deleteUserHandler(user._id)}
                                disabled={isLoading}
                            >
                                {" "}
                                <i className="fa fa-trash"></i>{" "}
                            </button>
                        )}
                    </>
                ),
            });
        });

        return data;
    };


    const deleteUserHandler = (id: string) => {
        deleteUser(id);
    };

    return (
        <div className="container">
            <h1 className="my-5">{`${users?.length} Users`}</h1>
            <MDBDataTable
                data={setUsers()}
                className="px-3"
                bordered
                striped
                hover
            />
        </div>
    );
};

export default AllUsers;
