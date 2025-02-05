import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// ✅ Form validation schema for Individual Email
const individualEmailSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export function EmailSender() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailType, setEmailType] = useState<"individual" | "bulk">("individual");

  // ✅ Individual Email Form
  const {
    register: registerIndividual,
    handleSubmit: handleSubmitIndividual,
    reset: resetIndividual,
    formState: { errors: errorsIndividual },
  } = useForm({ resolver: zodResolver(individualEmailSchema) });

  // ✅ Bulk Email Form (No Zod validation for file)
  const {
    register: registerBulk,
    handleSubmit: handleSubmitBulk,
    reset: resetBulk,
    formState: { errors: errorsBulk },
  } = useForm();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Individual Email Submit Handler
  const onSubmitIndividual = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        toast({ title: "Success", description: result.message });
        resetIndividual();
      } else {
        toast({ title: "Error", description: result.message || "Something went wrong.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send email.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Bulk Email Submit Handler (Sending as multipart-form data)
  const onSubmitBulk = async (data: any) => {
    setIsLoading(true);
    try {
      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        toast({ title: "Error", description: "File is required", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("subject", data.subject);
      formData.append("message", data.message);

      const endpoint = file.name.endsWith(".csv") ? "/api/send-bulk-emails-from-csv" : "/api/send-bulk-emails-from-excel";
      const response = await fetch(endpoint, { method: "POST", body: formData });

      const result = await response.json();
      if (response.ok) {
        toast({ title: "Success", description: result.message });
        resetBulk();
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        toast({ title: "Error", description: result.message || "Something went wrong.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send bulk emails.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Email Sender</h1>

      {/* Toggle Buttons */}
      <div className="flex space-x-4 mb-6">
        <Button variant={emailType === "individual" ? "default" : "outline"} onClick={() => setEmailType("individual")}>
          Individual Email
        </Button>
        <Button variant={emailType === "bulk" ? "default" : "outline"} onClick={() => setEmailType("bulk")}>
          Bulk Email
        </Button>
      </div>

      {/* ✅ Individual Email Form */}
      {emailType === "individual" && (
        <form onSubmit={handleSubmitIndividual(onSubmitIndividual)} className="space-y-4">
          <Label htmlFor="to">Recipient Email</Label>
          <Input id="to" {...registerIndividual("to")} />
          {errorsIndividual.to && <p className="text-red-500">{errorsIndividual.to.message?.toString()}</p>}

          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" {...registerIndividual("subject")} />
          {errorsIndividual.subject && <p className="text-red-500">{errorsIndividual.subject.message?.toString()}</p>}

          <Label htmlFor="message">Message</Label>
          <Textarea id="message" {...registerIndividual("message")} />
          {errorsIndividual.message && <p className="text-red-500">{errorsIndividual.message.message?.toString()}</p>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Email"}
          </Button>
        </form>
      )}

      {/* ✅ Bulk Email Form */}
      {emailType === "bulk" && (
        <form onSubmit={handleSubmitBulk(onSubmitBulk)} className="space-y-4">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" {...registerBulk("subject")} />
          {errorsBulk.subject && <p className="text-red-500">{errorsBulk.subject.message?.toString()}</p>}

          <Label htmlFor="message">Message</Label>
          <Textarea id="message" {...registerBulk("message")} />
          {errorsBulk.message && <p className="text-red-500">{errorsBulk.message.message?.toString()}</p>}

          <Label htmlFor="file">Upload File (CSV or Excel)</Label>
          <Input id="file" type="file" accept=".csv,.xlsx,.xls" ref={fileInputRef} />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Bulk Emails"}
          </Button>
        </form>
      )}

      <Toaster />
    </div>
  );
}
