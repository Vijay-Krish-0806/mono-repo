"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModal } from "../../../../hooks/use-modal-store";

import { Button } from "@/components/ui/button";

import qs from "query-string";

import { useState } from "react";
import axios from "axios";
import { DialogDescription } from "@radix-ui/react-dialog";
import {  useRouter } from "next/navigation";

export default function DeleteChannelModal() {
  const { onClose, type, data, isOpen } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const isOpenModal = isOpen && type === "deleteChannel";
  const router = useRouter();
  const { server, channel } = data;
  const onClick = async () => {
    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        },
      });
      await axios.delete(url);
      onClose();
      router.refresh();
      router.push(`/me/servers/${server?.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpenModal} onOpenChange={onClose}>
        <DialogContent className="bg-white text-black p-1 overflow-hidden">
          <DialogHeader className="pt-6 px-2">
            <DialogTitle className="text-2xl text-center font-bold">
              Delete Channel
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              Are you sure you want to do this?{" "}
              <span className="font-semibold text-indigo-500">
                #{channel?.name}
              </span>
              will be permenantly deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-gray-100 px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <Button disabled={isLoading} onClick={onClose} variant="ghost">
                Cancel
              </Button>
              <Button disabled={isLoading} onClick={onClick} variant="primary">
                Confirm
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
