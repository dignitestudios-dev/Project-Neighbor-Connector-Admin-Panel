"use client";

import { useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NotificationFormInputs {
  title: string;
  description: string;
  when?: string;
}

interface CreateNotificationModalProps {
  showCreateModal: boolean;
  setShowCreateModal: (value: boolean) => void;
  onSubmitNotification: (data: NotificationFormInputs) => Promise<void> | void;
  isSubmitting: boolean;
}

const MAX_TITLE = 70;
const MAX_DESCRIPTION = 700;

const toSentenceCaseFirst = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  showCreateModal,
  setShowCreateModal,
  onSubmitNotification,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<NotificationFormInputs>({
    defaultValues: { title: "", description: "" },
  });

  const title = watch("title") ?? "";
  const description = watch("description") ?? "";

  const titleCount = useMemo(() => title.length, [title]);
  const descriptionCount = useMemo(() => description.length, [description]);

  const onSubmit: SubmitHandler<NotificationFormInputs> = async (data) => {
    await onSubmitNotification(data);
    reset();
  };

  return (
    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle style={{ color: "var(--primary-blue)" }}>Create Notification</DialogTitle>
          <DialogDescription>
            Add a title and description for the notification.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              {...register("title", {
                required: "Title is required",
                maxLength: { value: MAX_TITLE, message: `Title must be ${MAX_TITLE} characters or less` },
                onChange: (e) => {
                  const value = e.target.value.slice(0, MAX_TITLE);
                  setValue("title", toSentenceCaseFirst(value), { shouldValidate: true });
                },
              })}
              maxLength={MAX_TITLE}
              placeholder="Enter notification title"
            />
            <div className="flex items-center justify-between">
              {errors.title ? (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-muted-foreground">
                {titleCount}/{MAX_TITLE}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              {...register("description", {
                required: "Description is required",
                maxLength: {
                  value: MAX_DESCRIPTION,
                  message: `Description must be ${MAX_DESCRIPTION} characters or less`,
                },
              })}
              maxLength={MAX_DESCRIPTION}
              placeholder="Enter notification description"
              className="min-h-32"
            />
            <div className="flex items-center justify-between">
              {errors.description ? (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-muted-foreground">
                {descriptionCount}/{MAX_DESCRIPTION}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNotificationModal;
