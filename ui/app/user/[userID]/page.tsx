"use client";
import { Loader } from "@/components/custom/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IUser } from "@/interfaces/IUser";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FaRegCopy } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { ISession } from "@/interfaces/ISession";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { formatTimestampWithAddedDays } from "@/utils/date";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoMdMore } from "react-icons/io";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCopy from "@/hooks/useCopy";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { capitalizeFirstLetter } from "@/utils/string";
import { GoClockFill } from "react-icons/go";
import { TiTick } from "react-icons/ti";
import { IoIosWarning } from "react-icons/io";
import { format } from "date-fns";

const UserDetails = ({ params }: any) => {
  const { userID } = params;
  const { copyHandler } = useCopy();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<IUser | null>(null);
  const [role, setRole] = React.useState("");
  const [name, setName] = React.useState("");
  const [sessions, setSessions] = React.useState([] as ISession[]);
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const router = useRouter();

  // function to update is_active
  const updateUserActive = async (is_active: boolean) => {
    try {
      setLoading(true);
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT}/api/user/toggle-active-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user?.email,
            is_active: is_active,
          }),
        }
      );
      await getUser();
    } catch (error) {
      console.error("Error during POST request:", error);
    }
    setLoading(false);
  };

  const getUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT}/api/user/get-from-uid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: userID,
          }),
        }
      );
      const { data } = await res.json();
      setUser(data);
      setRole(data?.role || "");
      setName(data?.name || "");
    } catch (error) {
      console.error("Error during POST request:", error);
    }
    setLoading(false);
  };

  // fetch all sessions
  const fetchAllSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT}/api/session/get-all-from-uid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: userID,
          }),
          cache: "no-cache",
        }
      );
      const { data } = await res.json();
      setSessions(data);
    } catch (error) {
      console.error("Error during POST request:", error);
    }
    setLoading(false);
  };

  // delete user function
  const deleteUser = async (email: string) => {
    try {
      setLoading(true);
      await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT}/api/user/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });
      router.push("/");
    } catch (error) {
      console.error("Error during POST request:", error);
    }
    setLoading(false);
  };

  // revoke session function
  const revokeSession = async (session_id: string) => {
    try {
      setLoading(true);
      await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT}/api/session/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id,
          uid: userID,
        }),
      });
      await fetchAllSessions();
    } catch (error) {
      console.error("Error during POST request:", error);
    }
    setLoading(false);
  };

  // delete session function
  const deleteSession = async (session_id: string) => {
    try {
      setLoading(true);
      await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT}/api/session/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id,
          uid: userID,
        }),
      });
      await fetchAllSessions();
    } catch (error) {
      console.error("Error during POST request:", error);
    }
    setLoading(false);
  };

  // delete all sessions function
  const deleteAllSessions = async () => {
    try {
      setLoading(true);
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT}/api/session/delete-all`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: userID,
          }),
        }
      );
      await fetchAllSessions();
    } catch (error) {
      console.error("Error during POST request:", error);
    }
    setLoading(false);
  };

  // revoke all sessions function
  const revokeAllSessions = async () => {
    try {
      setLoading(true);
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT}/api/session/revoke-all`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: userID,
          }),
        }
      );
      await fetchAllSessions();
    } catch (error) {
      console.error("Error during POST request:", error);
    }
    setLoading(false);
  };

  // reset password function
  const resetPassword = async (
    email: string,
    old_password: string,
    new_password: string
  ) => {
    if (
      old_password === "" ||
      new_password === "" ||
      confirmNewPassword === ""
    ) {
      toast({
        title: "Error",
        description: "Fill all the fields correctly.",
        variant: "destructive",
      });
      return;
    } else {
      if (new_password !== confirmNewPassword) {
        toast({
          title: "Error",
          description: "New and Confirm New Passwords do not match.",
          variant: "destructive",
        });
        return;
      }
    }
    try {
      setLoading(true);
      await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT}/api/password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          old_password,
          new_password,
        }),
      });
    } catch (error) {
      console.error("Error during POST request:", error);
    } finally {
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
    setLoading(false);
  };

  // forget password request function
  const forgetPassword = async (email: string) => {
    try {
      setLoading(true);
      await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT}/api/password/forget-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );
    } catch (error) {
      console.error("Error during POST request:", error);
    }
    setLoading(false);
  };

  // edit user function
  const editUser = async (email: string, name: string, role: string) => {
    if (name === "" || role === "") {
      toast({
        title: "Error",
        description: "Fill all the fields correctly.",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      if (role !== user?.role) {
        await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT}/api/user/update-role`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user?.email,
              role,
            }),
          }
        );
      }
      if (name !== user?.name) {
        await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT}/api/user/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            name,
          }),
        });
      }
      await getUser();
    } catch (error) {
      console.error("Error during POST request:", error);
    }
    setLoading(false);
  };

  const sessionColumns: ColumnDef<ISession>[] = [
    {
      accessorKey: "session_id",
      header: "Session ID",
      cell: ({ row }) => {
        const session_id: string = row.getValue("session_id") as string;

        return (
          <div className="group w-44 flex justify-between gap-2 items-center">
            <h1 className="w-40 truncate cursor-pointer hover:underline">
              {session_id}
            </h1>
            <FaRegCopy onClick={() => copyHandler(session_id, "Session ID")} />
          </div>
        );
      },
    },
    {
      accessorKey: "user_agent",
      header: "User Agent",
    },
    {
      accessorKey: "is_revoked",
      header: "Is Revoked",
      cell: ({ row }) => {
        return (
          <div>{capitalizeFirstLetter(row.original.is_revoked.toString())}</div>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: "Updated At",
      cell: ({ row }) => {
        return (
          <div>
            {new Date(
              parseInt(row.original.updated_at.$date.$numberLong)
            ).toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Expires At",
      cell: ({ row }) => {
        return (
          <div>
            {formatTimestampWithAddedDays(
              parseInt(row.original.created_at.$date.$numberLong),
              45
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: "Action",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <IoMdMore size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {!row.original.is_revoked && (
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-accent hover:cursor-pointer"
                  >
                    <AlertDialog>
                      <AlertDialogTrigger className="relative flex items-center w-32 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent cursor-pointer">
                        Revoke
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <Button
                            variant="destructive"
                            onClick={async () => {
                              await revokeSession(session.session_id);
                              await fetchAllSessions();
                            }}
                          >
                            {loading ? <Loader /> : <h1>Continue</h1>}
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  asChild
                  className="hover:bg-accent hover:cursor-pointer"
                >
                  <AlertDialog>
                    <AlertDialogTrigger className="relative flex items-center w-32 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent cursor-pointer">
                      Delete
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            await deleteSession(session.session_id);
                            await fetchAllSessions();
                          }}
                        >
                          {loading ? <Loader /> : <h1>Continue</h1>}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getUser();
    fetchAllSessions();
  }, []);

  return (
    <div className="p-6">
      <div>
        {loading ? (
          <div className="h-[calc(100vh-10rem)] flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <div>
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <h1>{user?.name}</h1>
                  {/* <Button variant="outline" onClick={() => copyHandler(user?.uid!, "UID")} className='flex gap-2'>
                                            Copy UID <FaRegCopy />
                                        </Button> */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2 items-center">
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button>Update</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="mb-2">
                              Update User Name
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                              <h1>Name</h1>
                              <Input
                                type="text"
                                placeholder="Enter Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                              />
                              <h1>Role</h1>
                              <Input
                                type="text"
                                placeholder="Enter Role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                              />
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button
                              variant="destructive"
                              onClick={async () => {
                                await editUser(user?.email!, name, role);
                              }}
                            >
                              {loading ? <Loader /> : <h1>Continue</h1>}
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button variant="destructive">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button
                              variant="destructive"
                              onClick={async () => {
                                await deleteUser(user?.email!);
                              }}
                            >
                              {loading ? <Loader /> : <h1>Continue</h1>}
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline">
                            <IoMdMore className=" rotate-90" size={20} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            asChild
                            className="hover:bg-accent hover:cursor-pointer"
                          >
                            <AlertDialog>
                              <AlertDialogTrigger className="relative flex items-center w-full rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent cursor-pointer">
                                Reset Password
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Reset Password
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="space-y-2">
                                    <Input
                                      type="text"
                                      placeholder="Enter Old Password"
                                      value={oldPassword}
                                      onChange={(e) =>
                                        setOldPassword(e.target.value)
                                      }
                                    />
                                    <Input
                                      type="text"
                                      placeholder="Enter New Password"
                                      value={newPassword}
                                      onChange={(e) =>
                                        setNewPassword(e.target.value)
                                      }
                                    />
                                    <Input
                                      type="text"
                                      placeholder="Enter New Password"
                                      value={confirmNewPassword}
                                      onChange={(e) =>
                                        setConfirmNewPassword(e.target.value)
                                      }
                                    />
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <Button
                                    variant="destructive"
                                    onClick={async () => {
                                      await resetPassword(
                                        user?.email!,
                                        oldPassword,
                                        newPassword
                                      );
                                    }}
                                  >
                                    {loading ? <Loader /> : <h1>Continue</h1>}
                                  </Button>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            asChild
                            className="hover:bg-accent hover:cursor-pointer"
                          >
                            <AlertDialog>
                              <AlertDialogTrigger className="relative flex items-center w-full rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent cursor-pointer">
                                Forget Password
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Forget Password
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <Button
                                    variant="destructive"
                                    onClick={async () => {
                                      await forgetPassword(user?.email!);
                                    }}
                                  >
                                    {loading ? <Loader /> : <h1>Continue</h1>}
                                  </Button>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p>{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Role</p>
                    <p>{user?.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Email Verification
                    </p>
                    <Badge
                      className={`${
                        user?.email_verified ? "bg-green-500" : "bg-yellow-500"
                      } flex gap-1 w-fit rounded`}
                    >
                      {user?.email_verified ? <TiTick /> : <GoClockFill />}

                      {user?.email_verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Status</p>
                    <Badge
                      className={`${
                        user?.is_active
                          ? "bg-green-500"
                          : "bg-red-500 text-white"
                      } flex gap-1 w-fit rounded`}
                    >
                      {user?.is_active ? <TiTick /> : <IoIosWarning />}

                      {user?.is_active ? "Active" : "Suspended"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Created At</p>
                    <p>
                      {format(
                        new Date(parseInt(user?.created_at.$date.$numberLong!)),
                        "PP - p"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Updated At</p>
                    <p>
                      {format(
                        new Date(parseInt(user?.updated_at.$date.$numberLong!)),
                        "PP - p"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="mt-10">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <h1>Sessions</h1>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline">
                        <IoMdMore className=" rotate-90" size={20} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        asChild
                        className="hover:bg-accent hover:cursor-pointer"
                      >
                        <AlertDialog>
                          <AlertDialogTrigger className="relative flex items-center w-full rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent cursor-pointer">
                            Revoke All
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <Button
                                variant="destructive"
                                onClick={async () => {
                                  await revokeAllSessions();
                                }}
                              >
                                {loading ? <Loader /> : <h1>Continue</h1>}
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        asChild
                        className="hover:bg-accent hover:cursor-pointer"
                      >
                        <AlertDialog>
                          <AlertDialogTrigger className="relative flex items-center w-full rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent cursor-pointer">
                            Delete All
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <Button
                                variant="destructive"
                                onClick={async () => {
                                  await deleteAllSessions();
                                }}
                              >
                                {loading ? <Loader /> : <h1>Continue</h1>}
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={sessions ? sessions : []}
                  columns={sessionColumns}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
