"use client";
import React from 'react'
import Overview from '@/components/Overview/Overview'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'

const OverviewPage = () => {
    const router = useRouter();
    return (
        <div>
            {<Tabs defaultValue="overview" className="w-full mb-4">
                <TabsList>
                    <TabsTrigger value="overview" onClick={() => router.push("/")}>Overview</TabsTrigger>
                    <TabsTrigger value="users" onClick={() => router.push("/user")}>Ussrs</TabsTrigger>
                </TabsList>
            </Tabs>}
            <Overview />
        </div>
    )
}

export default OverviewPage