import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/CardUI";
import { Input } from "@/components/ui/input";

interface ConsentSection {
  id: number;
  title: string;
  content: {
    before?: string; // Content before options
    options?: string[]; // Simple array of options
    after?: string; // Content after options
  };
  requiresConsent: boolean;
}

// Example sections
const ASSISTANT_CONSENT_SECTIONS: ConsentSection[] = [
  {
    id: 0,
    title: "Introduction",
    content: {
      before:
        "EYFS requirement 3.43 states: ‘If a childminder employs an assistant or works with another childminder, each childminder (or assistant) may care for the number of children permitted by the ratios specified above. Children may be left in the sole care of childminders’ assistants for two hours at most in a single day. Childminders must obtain parents and/or carers’ permission to leave children with an assistant, including for very short periods of time.’",
    },
    requiresConsent: false,
  },
  {
    id: 1,
    title: "Assistant Information",
    content: {
      before:
        "My assistants are – Piyush Kheria, Gabriela Mariana.\n\nI work with my assistant between the hours of 9:00 am and 19:00 Monday to Friday. Please note that any given point in time I do not have more than 2 assistants.",
    },
    requiresConsent: false,
  },
  {
    id: 2,
    title: "Assistant Qualifications",
    content: {
      before: "My assistants are registered with Ofsted and:",
      after:
        "• Has completed a paediatric first aid course to comply with EYFS requirement 3.24 - only required for assistants who are left unsupervised for up to 2 hours a day (including on school drops and collections) with children\n\n• Has a DBS disclosure\n\n• Has completed in-house induction training including training to ensure compliance with the General Data Protection Regulation (GDPR) and a safeguarding children / child protection training course\n\n• Has read the Policies and Procedures of the provision to comply with EYFS requirement 3.3\n\n• Is regularly supervised, supported and trained to ensure I am happy with the work they do to comply with EYFS requirement 3.23",
    },
    requiresConsent: false,
  },
  {
    id: 3,
    title: "Information Sharing",
    content: {
      before: "Information I will share with my assistant includes:",
      after:
        "• Details about your child’s care - for example, information about any allergies or special food requirements\n\n• Details about your child’s development – for example, observations, assessments and individual planning.\n\n• Details about your child’s safety – for example, if your child needs extra support to access resources.\n\n• Your emergency contact details.",
    },
    requiresConsent: false,
  },
  {
    id: 4,
    title: "Declaration",
    content: {
      before:
        "Further to my ‘Assistant Permission – information for parents’ letter, I am required by the EYFS to ask your permission for my assistants to be left unsupervised with your child for up to 2 hours a day.\n\nAs explained, I will share information about your child with my assistants to support your child’s care, health, safety, learning and development.\n\nBy signing this form, you acknowledge your understanding that I work with an assistant and:\n\n• Give your permission for your child to be left for up to 2 hours unsupervised with my assistants\n\n• Understand that your child’s personal information including (but not limited to) their name, date of birth, medical or dietary allergies and learning and development progress will be shared with my assistant to support their care, learning and development.",
    },

    requiresConsent: true,
  },
];

interface ConsentFormProps {
  onClose: () => void;
}

export function AssistantConsentForm({ onClose }: ConsentFormProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [assistantConsents, setAssistantConsents] = useState<
    Record<
      number,
      {
        agreed: boolean;
        selectedOptions: string[];
      }
    >
  >({});
  const [parentSignature, setParentSignature] = useState("");
  const [parentNotes, setParentNotes] = useState("");
  const currentDate = new Date().toLocaleDateString();

  const currentSectionData = ASSISTANT_CONSENT_SECTIONS[currentSection];
  const isFirstSection = currentSection === 0;
  const isLastSection =
    currentSection === ASSISTANT_CONSENT_SECTIONS.length - 1;

  const handleNext = () => {
    if (!isLastSection) {
      setCurrentSection((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      setCurrentSection((prev) => prev - 1);
    }
  };

  const handleConsent = (sectionId: number, checked: boolean) => {
    setAssistantConsents((prev) => ({
      ...prev,
      [sectionId]: {
        agreed: checked,
        selectedOptions: prev[sectionId]?.selectedOptions || [],
      },
    }));
  };

  const handleOptionToggle = (sectionId: number, optionId: string) => {
    setAssistantConsents((prev) => {
      const currentOptions = prev[sectionId]?.selectedOptions || [];
      const newOptions = currentOptions.includes(optionId)
        ? currentOptions.filter((id) => id !== optionId)
        : [...currentOptions, optionId];

      return {
        ...prev,
        [sectionId]: {
          agreed: prev[sectionId]?.agreed || false,
          selectedOptions: newOptions,
        },
      };
    });
  };

  const handleSubmit = () => {
    if (!parentSignature.trim()) {
      alert("Please provide your signature");
      return;
    }
    console.log("Assistant Consents:", assistantConsents);
    console.log("Signature:", parentSignature);
    console.log("Date:", currentDate);
    console.log("Parent Notes:", parentNotes);
    onClose();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col h-[600px]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{currentSectionData.title}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {currentSection + 1} of {ASSISTANT_CONSENT_SECTIONS.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {currentSectionData.content.before && (
            <div className="prose dark:prose-invert whitespace-pre-wrap">
              {currentSectionData.content.before}
            </div>
          )}

          {currentSectionData.content.options && (
            <div className="space-y-2 ml-4">
              {currentSectionData.content.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`option-${currentSectionData.id}-${index}`}
                    checked={
                      assistantConsents[
                        currentSectionData.id
                      ]?.selectedOptions.includes(index.toString()) || false
                    }
                    onCheckedChange={(checked) =>
                      handleOptionToggle(
                        currentSectionData.id,
                        index.toString()
                      )
                    }
                  />
                  <label
                    htmlFor={`option-${currentSectionData.id}-${index}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          )}

          {currentSectionData.content.after && (
            <div className="prose dark:prose-invert whitespace-pre-wrap">
              {currentSectionData.content.after}
            </div>
          )}

          {isLastSection && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Additional Notes (Optional):
                </label>
                <textarea
                  id="notes"
                  value={parentNotes}
                  onChange={(e) => setParentNotes(e.target.value)}
                  placeholder="Enter any additional notes or comments here"
                  className="w-full min-h-[100px] p-2 text-sm rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="signature" className="text-sm font-medium">
                  Parent/Guardian Signature (Type your full name):
                </label>
                <Input
                  id="signature"
                  value={parentSignature}
                  onChange={(e) => setParentSignature(e.target.value)}
                  placeholder="Type your full name"
                  className="max-w-md"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date:</label>
                <div className="text-sm">{currentDate}</div>
              </div>
            </div>
          )}

          {currentSectionData.requiresConsent && (
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id={`consent-${currentSectionData.id}`}
                checked={
                  assistantConsents[currentSectionData.id]?.agreed || false
                }
                onCheckedChange={(checked) =>
                  handleConsent(currentSectionData.id, checked as boolean)
                }
              />
              <label
                htmlFor={`consent-${currentSectionData.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I consent to this section
              </label>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between mt-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstSection}
          >
            Previous
          </Button>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {isLastSection ? (
              <Button onClick={handleSubmit}>Submit</Button>
            ) : (
              <Button onClick={handleNext}>Next</Button>
            )}
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
