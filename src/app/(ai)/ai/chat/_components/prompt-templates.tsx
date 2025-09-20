"use client";

import React, { useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateStudyQuestions } from "@/ai/flows/generate-study-questions";
import { generateQuizQuestions } from "@/ai/flows/generate-quiz-questions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";


const studySchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
  numberOfQuestions: z.coerce.number().min(1).max(10),
});

const quizSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
  numQuestions: z.coerce.number().min(1).max(5),
});

export function PromptTemplates() {
  const [isStudyPending, startStudyTransition] = useTransition();
  const [isQuizPending, startQuizTransition] = useTransition();
  const [studyResult, setStudyResult] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<any[]>([]);
  const { toast } = useToast();

  const studyForm = useForm<z.infer<typeof studySchema>>({
    resolver: zodResolver(studySchema),
    defaultValues: { topic: "", numberOfQuestions: 3 },
  });

  const quizForm = useForm<z.infer<typeof quizSchema>>({
    resolver: zodResolver(quizSchema),
    defaultValues: { topic: "", numQuestions: 3 },
  });

  const onStudySubmit = (values: z.infer<typeof studySchema>) => {
    startStudyTransition(async () => {
      setStudyResult([]);
      try {
        const result = await generateStudyQuestions(values);
        if (result.questions.length > 0) {
          setStudyResult(result.questions);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not generate study questions.",
          });
        }
      } catch (error) {
         toast({
            variant: "destructive",
            title: "Error",
            description: "An error occurred while generating questions.",
          });
      }
    });
  };

  const onQuizSubmit = (values: z.infer<typeof quizSchema>) => {
    startQuizTransition(async () => {
      setQuizResult([]);
      try {
        const result = await generateQuizQuestions(values);
        if (result.questions.length > 0) {
          setQuizResult(result.questions);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not generate a quiz.",
          });
        }
      } catch(error) {
         toast({
            variant: "destructive",
            title: "Error",
            description: "An error occurred while generating the quiz.",
          });
      }
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 pr-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate Study Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...studyForm}>
              <form
                onSubmit={studyForm.handleSubmit(onStudySubmit)}
                className="space-y-4"
              >
                <FormField
                  control={studyForm.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Photosynthesis" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={studyForm.control}
                  name="numberOfQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isStudyPending} className="w-full">
                  {isStudyPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate
                </Button>
              </form>
            </Form>
            {studyResult.length > 0 && (
              <div className="mt-4 space-y-2 text-sm">
                <h3 className="font-semibold">Generated Questions:</h3>
                <ul className="list-inside list-disc space-y-1">
                  {studyResult.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create a Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...quizForm}>
              <form
                onSubmit={quizForm.handleSubmit(onQuizSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={quizForm.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., The Solar System"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={quizForm.control}
                  name="numQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isQuizPending} className="w-full">
                  {isQuizPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Quiz
                </Button>
              </form>
            </Form>
            {quizResult.length > 0 && (
              <div className="mt-4">
                 <h3 className="font-semibold mb-2">Generated Quiz:</h3>
                <Accordion type="single" collapsible className="w-full">
                  {quizResult.map((q, i) => (
                    <AccordionItem value={`item-${i}`} key={i}>
                      <AccordionTrigger>{`Question ${i + 1}: ${
                        q.question
                      }`}</AccordionTrigger>
                      <AccordionContent>
                        <RadioGroup disabled className="space-y-2">
                          {q.options.map((opt: string, j: number) => (
                             <div key={j} className="flex items-center space-x-2">
                                <RadioGroupItem value={opt} id={`q${i}-opt${j}`} />
                                <Label htmlFor={`q${i}-opt${j}`}>{opt}</Label>
                              </div>
                          ))}
                        </RadioGroup>
                         <p className="mt-4 text-sm font-semibold text-primary">Correct Answer: {q.correctAnswer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
