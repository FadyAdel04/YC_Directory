"use client";

import { z } from "zod";
import { redirect } from "next/navigation";
import MDEditor from "@uiw/react-md-editor";
import { ExternalLink } from "lucide-react";
import { useState, useActionState } from "react";

import { createIdea } from "@/lib/action";
import { formSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const StartupForm = () => {
  const [pitch, setPitch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "IDEAL",
  });

  async function handleFormSubmit(prevState: any, formData: FormData) {
    try {
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        link: formData.get("link") as string,
        pitch,
      };

      // Validate form values
      await formSchema.parseAsync(formValues);

      // Create the idea and handle the result
      const result = await createIdea(prevState, formData, pitch);
      if (result.status === "SUCCESS") {
        redirect(`/idea/${result._id}`);
      }
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(fieldErrors as unknown as Record<string, string>);
        return { ...prevState, error: "Validation failed", status: "ERROR" };
      }
      return {
        ...prevState,
        error: "An unexpected error occurred",
        status: "ERROR",
      };
    } finally {
      setPitch("");
    }
  }

  return (
    <form action={formAction} className="startup-form">
      <div>
        <label htmlFor="title" className="startup-form_label">
          Title
        </label>
        <Input
          id="title"
          name="title"
          className="startup-form_input"
          required
          placeholder="JSM Academy Masterclasss"
        />

        {errors.title && <p className="startup-form_error">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="startup-form_label">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="startup-form_input"
          rows={5}
          required
          placeholder="Short description of your startup idea"
        />

        {errors.description && (
          <p className="startup-form_error">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="startup-form_label">
          Category
        </label>
        <Input
          id="category"
          name="category"
          required
          className="startup-form_input"
          placeholder="Choose a category (e.g., Tech, Health, Education, etc.)"
        />

        {errors.category && (
          <p className="startup-form_error">{errors.category}</p>
        )}
      </div>

      <div>
        <label htmlFor="link" className="startup-form_label">
          Image link
        </label>
        <Input
          id="link"
          name="link"
          type="url"
          className="startup-form_input"
          required
          placeholder="Paste a link to your demo or promotional media"
        />

        {errors.link && <p className="startup-form_error">{errors.link}</p>}
      </div>

      <div data-color-mode="light">
        <label htmlFor="pitch" className="startup-form_label">
          Pitch
        </label>

        <MDEditor
          id="pitch"
          value={pitch}
          preview="edit"
          height={300}
          onChange={(value) => setPitch(value as string)}
          className="startup-form_editor"
          style={{
            borderRadius: 20,
            overflow: "hidden",
          }}
          textareaProps={{
            placeholder:
              "Briefly describe your idea and what problem it solves ",
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
        />

        {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="startup-form_btn">
        <ExternalLink className="size-6 mr-2" />
        {isPending ? "Submitting..." : "Submit Your Pitch"}
      </Button>
    </form>
  );
};

export default StartupForm;
