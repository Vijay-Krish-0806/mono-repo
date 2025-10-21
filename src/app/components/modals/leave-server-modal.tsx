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
import { useState } from "react";
import axios from "axios";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

export default function LeaveServerModal() {
  const { onClose, type, data, isOpen } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const isOpenModal = isOpen && type === "leaveServer";
  const router = useRouter();
  const { server } = data;
  const confirmation=async()=>{
    try{
      setIsLoading(true);
      await axios.patch(`/api/servers/${server?.id}/leave`);
      onClose();
      router.refresh();
      router.push('/me')
    }catch(error){
      console.log(error);
    }finally{
      setIsLoading(false);
    }
  }

  return (
    <>
      <Dialog open={isOpenModal} onOpenChange={onClose}>
        <DialogContent className="bg-white text-black p-1 overflow-hidden">
          <DialogHeader className="pt-6 px-2">
            <DialogTitle className="text-2xl text-center font-bold">
              Leave Server
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              Are you sure you want to leave <span className="font-semibold text-rose-500">{server?.name}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-gray-100 px-6 py-4">
             <div className="flex items-center justify-between w-full">
              <Button disabled={isLoading} onClick={onClose} variant="ghost">
                Cancel
              </Button>
              <Button  disabled={isLoading} onClick={confirmation} variant="primary">
                Confirm
              </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
