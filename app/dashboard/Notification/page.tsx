"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { AppDispatch, RootState } from "@/lib/store";
import { createNotification, fetchNotifications } from "@/lib/slices/notificationSlice";
import { DataTable } from "./components/data-table";
import CreateNotificationModal from "./components/create-notification-modal";

export default function Notification() {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, pagination, loading } = useSelector(
    (state: RootState) => state.notification
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const paginationData = {
    currentPage: pagination?.currentPage ?? currentPage,
    itemsPerPage: pagination?.itemsPerPage ?? pageSize,
    totalPages: pagination?.totalPages ?? 1,
    setCurrentPage: (page: number) => setCurrentPage(page),
    setPageSize: (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
    },
  };

  useEffect(() => {
    dispatch(fetchNotifications({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleCreateNotification = async (data: {
    title: string;
    description: string;
    when?: string;
  }) => {
    setIsCreating(true);
    try {
      await dispatch(createNotification(data)).unwrap();
      await dispatch(fetchNotifications({ page: currentPage, limit: pageSize }));
      setShowCreateModal(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary" style={{ color: "var(--primary-blue)" }}>
          Notifications
        </h2>
      </div>

      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => setShowCreateModal(true)}
          className="text-white"
          style={{ backgroundColor: "var(--primary-blue)" }}
        >
          Add Notification
        </Button>
      </div>

      <CreateNotificationModal
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        onSubmitNotification={handleCreateNotification}
        isSubmitting={isCreating}
      />

      <div className="p-4">
        <DataTable notifications={notifications} pagination={paginationData} loading={loading} />
      </div>
    </div>
  );
}
