"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface NotificationFormInputs {
  title: string;
  description: string;
  when?: string;
}

interface CreateNotificationModalProps {
  showCreateModal: boolean;
  setShowCreateModal: (value: boolean) => void;
  onSubmitNotification: (data: NotificationFormInputs) => void;
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  showCreateModal,
  setShowCreateModal,
  onSubmitNotification,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NotificationFormInputs>();

  const onSubmit: SubmitHandler<NotificationFormInputs> = (data) => {
    onSubmitNotification(data);
    reset(); // form reset after submit
    setShowCreateModal(false);
  };

  if (!showCreateModal) return null; // modal hidden if false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={() => setShowCreateModal(false)}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Create Notification</h2>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="Enter notification title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              id="description"
              {...register("description", { required: "Description is required" })}
              placeholder="Enter notification description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotificationModal;