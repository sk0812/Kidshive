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
const CONSENT_SECTIONS: ConsentSection[] = [
  {
    id: 0,
    title: "Introduction",
    content: {
      before:
        "During your child's time in my care, certain circumstances and situations may arise where it is important that am I clear on your wishes for your child. I may also offer activities that you would prefer your child not to take part in.",
    },
    requiresConsent: false,
  },
  {
    id: 1,
    title: "First Aid / Emergency Medical Treatment",
    content: {
      before:
        "I give permission for First Aid to be given to my child as and when necessary or in the event of an emergency to seek medical / hospital assistance. I agree to provide up to date details of emergency contact numbers.",
    },
    requiresConsent: true,
  },
  {
    id: 2,
    title: "Administration of Non-Prescription Medication",
    content: {
      before:
        "I give permission for the following non-prescription medication to be administered to my child if he / she needs it:",
      options: ["Calpol", "Ibuprofen", "Teething Gel"],
      after:
        "I understand that I will need to have provided this medication in the bottle/packaging it was purchased and clearly labelled with my child's name and instructions on dosages allowed.\n\nI expect my childminder to contact me prior to administering the medication, especially if my child has been in her care for less than 4 hours. I will advise my childminder, when dropping off my child, if I have already given my child any medication prior to arrival.\n\nI agree to sign for any medication given when I return to collect my child.",
    },
    requiresConsent: true,
  },
  {
    id: 3,
    title: "Permission to go on outings ",
    content: {
      before:
        "I give permission for my child to be taken on outings which have been planned (the beach, museums, local attractions, etc) or spontaneous outings (the ducks, parks, local walks). \n\nI understand that I will be notified of any planned special trips in advance and will have the opportunity to discuss the details of such outings further.",
    },
    requiresConsent: true,
  },
  {
    id: 4,
    title: "Permission to be transported in a car ",
    content: {
      before:
        "I understand that my childminder may use a car to transport my child on various outings for example to playgroups, parks, etc and for dropping off /collecting children from school.\n\nI understand that my childminder will ensure that the car is properly maintained with a current MOT certificate and is insured for childminding purposes. I have had the opportunity to view my childminders driving license, current MOT and insurance certificates.\n\nI understand that my childminder will ensure that my child is securely fitted in a car seat which is suitable for their age, size and weight. I have been given details of the car seat to be used for my child and have been made aware of current car seat legislation.",
    },
    requiresConsent: true,
  },
  {
    id: 5,
    title: "Permission to take photos and videos",
    content: {
      before:
        "I give permission for photographs to be taken of my child and that these photographs and videos may be used for the following purposes:",
      options: [
        "My child's personal development records",
        "Evidence of the activities undertaken by my child",
        "Display on the notice board",
        "Printed publications that will be available to new parents",
        "Local Press / Newspapers / Magazines",
        "Childminder Website / Facebook Page",
      ],
    },
    requiresConsent: true,
  },
  {
    id: 6,
    title: "Permission to hold personal information",
    content: {
      before:
        "I give permission for personal information to be held about my child. I understand that it is essential for my childminder to have access to important information such as medical details to ensure the safety and wellbeing of my child. \n\nI understand that parents will only have access to their own child's records. \n\nAll documentation relating to your child is stored either in a lockable file or on my personal device and backed up on a database which is secured with a password.",
    },
    requiresConsent: true,
  },
  {
    id: 7,
    title: "Permission to share information",
    content: {
      before:
        "I understand that my childminder is obliged to act in the best interests of my child and that at times it may be beneficial to share or discuss information about my child with other relevant professionals, e.g. nursery keyworker, teacher, health visitor, speech therapist, social care professionals, health service workers, special needs coordinators, etc.\n\nI understand that I will be kept informed of any correspondence that takes place and that my consent to allow information to be shared may be withdrawn at any time.\n\nI understand that my childminder may pass on information without my consent if there is a legal requirement or duty to do so or if they are concerned for the welfare and safety of my child.",
    },
    requiresConsent: true,
  },
  {
    id: 8,
    title: "Permission to work with assistants",
    content: {
      before:
        "I understand that my childminder time to time works with assistants and I have received information about them. The assistants are DBS checked / applied for and have undergone / going paediatric first aid training. I understand that childminder may leave my child with authorised assistants for a period of up to two hours undettended by the childminder.",
    },
    requiresConsent: true,
  },
  {
    id: 9,
    title: "Permission to apply sunscreen",
    content: {
      before:
        "I give permission for sunscreen to be applied to my child during hot / sunny weather.\n\nI agree to provide a sun hat and suitable (high factor) sun cream for my child which will be clearly labelled with their name.",
    },
    requiresConsent: true,
  },
  {
    id: 10,
    title: "Permission to apply face paint",
    content: {
      before:
        "Children enjoy dressing up and role play. From time to time I may offer face painting to enhance this experience.\n\nPlease let me know if your child has sensitive skin or has previously had an allergic reaction to face paints.",
    },
    requiresConsent: true,
  },
  {
    id: 11,
    title: "Permission to use large play equipment",
    content: {
      before:
        "I give permission for my child to play on any large play equipment available at the childminding setting and at irks or other purpose built play areas that my childminder may take my child to on an outing (e.g. Soft Play, Play Parks, etc).",
    },
    requiresConsent: true,
  },
  {
    id: 12,
    title: "Declaration",
    content: {
      before:
        "I declare that I have read and understood all the above sections. I understand that by signing this form, I am giving my explicit consent where indicated. I understand that I can withdraw my consent at any time by discussing this with my childminder.\n\nI confirm that all the information I have provided is accurate and true to the best of my knowledge. I agree to inform the childminder of any changes to this information.",
    },
    requiresConsent: true,
  },
  // Add more sections as needed
];

interface ConsentFormProps {
  onClose: () => void;
}

export function ConsentForm({ onClose }: ConsentFormProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [consents, setConsents] = useState<
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

  const currentSectionData = CONSENT_SECTIONS[currentSection];
  const isFirstSection = currentSection === 0;
  const isLastSection = currentSection === CONSENT_SECTIONS.length - 1;

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
    setConsents((prev) => ({
      ...prev,
      [sectionId]: {
        agreed: checked,
        selectedOptions: prev[sectionId]?.selectedOptions || [],
      },
    }));
  };

  const handleOptionToggle = (sectionId: number, optionId: string) => {
    setConsents((prev) => {
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
    console.log("Consents:", consents);
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
              {currentSection + 1} of {CONSENT_SECTIONS.length}
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
                      consents[currentSectionData.id]?.selectedOptions.includes(
                        index.toString()
                      ) || false
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
                checked={consents[currentSectionData.id]?.agreed || false}
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
