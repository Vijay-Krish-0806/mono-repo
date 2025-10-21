"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModal } from "../../../../hooks/use-modal-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useOrigin } from "../../../../hooks/use-origin";
import { useState } from "react";
import axios from "axios";
import { Server } from "../../../../db/schema";

export default function InviteModal() {
  const { onOpen, onClose, type, data, isOpen } = useModal();
  const origin = useOrigin();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isOpenModal = isOpen && type === "invite";

  const { server } = data;
  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };
  const onNew = async () => {
    try {
      setIsLoading(true);
      const response = await axios.patch(
        `/api/servers/${server?.id}/invite-code`
      );
      onOpen("invite", { server: response.data });
    } catch (error) {
      console.error(error);
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
              Invite Friends
            </DialogTitle>
          </DialogHeader>
          <div className="pl-6">
            <Label className="uppercase text-sm font-bold text-zinc-500 dark:text-secondary/70">
              Server Invite Link
            </Label>
            <div className="flex items-center mt-2 gap-x-2 mb-2">
              <Input
                className="dark:bg-zinc-200 bg-zinc-200 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                value={inviteUrl}
                readOnly
                disabled={isLoading}
              />
              <Button size="icon" onClick={() => onCopy()} disabled={isLoading}>
                {copied ? <Check /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button
              variant={"link"}
              className="text-xs text-zinc-500"
              disabled={isLoading}
              onClick={onNew}
            >
              Generate a new link
              <RefreshCw className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
