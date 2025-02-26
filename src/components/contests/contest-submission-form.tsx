"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/shared/profile/image-upload";
import { submitContestEntry } from "@/lib/actions/contest.actions";
import { useToast } from "@/hooks/use-toast";
import { Contest } from "@/db/schema";
import { Icons } from "@/components/shared/icons";

const formSchema = z.object({
  contestId: z.string().uuid(),
  entryType: z.enum(["photo", "bio"]),
  photoUrl: z.string().url().optional(),
  bioText: z.string().min(10).max(1000).optional(),
  caption: z.string().max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ContestSubmissionFormProps {
  contest: Contest;
  onSuccess?: () => void;
}

export function ContestSubmissionForm({ contest, onSuccess }: ContestSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"photo" | "bio">(
    contest.type === "bio" ? "bio" : "photo"
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contestId: contest.id,
      entryType: activeTab,
      photoUrl: "",
      bioText: "",
      caption: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Validate based on entry type
      if (values.entryType === "photo" && !values.photoUrl) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please upload a photo for your entry",
        });
        return;
      }
      
      if (values.entryType === "bio" && !values.bioText) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please write a bio for your entry",
        });
        return;
      }

      const result = await submitContestEntry(values);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Your contest entry has been submitted",
        });
        form.reset();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error submitting contest entry:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit entry",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "photo" | "bio");
    form.setValue("entryType", value as "photo" | "bio");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Submit Your Entry</CardTitle>
        <CardDescription>
          Share your creativity for a chance to be featured in our Hall of Fame!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="photo" 
                  disabled={contest.type === "bio"}
                  className="flex items-center gap-2"
                >
                  <Icons.image className="h-4 w-4" />
                  Photo Entry
                </TabsTrigger>
                <TabsTrigger 
                  value="bio" 
                  disabled={contest.type === "photo"}
                  className="flex items-center gap-2"
                >
                  <Icons.text className="h-4 w-4" />
                  Bio Entry
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="photo" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="photoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Your Photo</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value ? [field.value] : []}
                          onChange={(urls) => field.onChange(urls[0] || "")}
                          maxFiles={1}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload a creative photo that matches the contest theme.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caption (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Add a caption to your photo..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description or caption for your photo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="bio" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="bioText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Creative Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your creative bio here..." 
                          className="min-h-[200px] resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Write a creative bio that showcases your personality (10-1000 characters).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <input type="hidden" {...form.register("contestId")} />
            <input type="hidden" {...form.register("entryType")} />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => form.reset()}>
          Cancel
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-pink-500 to-rose-400 text-white"
        >
          {isSubmitting ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Entry"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 