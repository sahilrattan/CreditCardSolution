"use client";

import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/utils/cn";

interface Person {
  name: string;
  title: string;
  image?: string;
}

const PersonCard = React.forwardRef<
  HTMLDivElement,
  Person & { isHighlighted?: boolean }
>(({ name, title, image, isHighlighted }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "text-center w-28 sm:w-32 p-2 sm:p-2 shadow-md bg-white dark:bg-slate-900 transition-transform duration-500",
      isHighlighted ? "scale-110 ring-2 ring-blue-500" : ""
    )}
  >
    <Avatar className="mx-auto mb-1 h-8 w-8">
      {image ? (
        <AvatarImage src={image} />
      ) : (
        <AvatarFallback className="bg-gray-100 text-gray-700 text-[10px]">
          {name
            .split(" ")
            .map((w) => w[0])
            .join("")}
        </AvatarFallback>
      )}
    </Avatar>
    <h4 className="font-semibold text-xs">{name}</h4>
    <p className="text-[10px] text-primary">{title}</p>
  </Card>
));
PersonCard.displayName = "PersonCard";

const CardWithConnector = ({
  person,
  lineHeight = 12,
  refMap,
  highlightName,
}: {
  person: Person;
  lineHeight?: number;
  refMap: React.RefObject<Record<string, HTMLDivElement | null>>;
  highlightName: string;
}) => (
  <div className="relative flex flex-col items-center">
    <PersonCard
      ref={(el) => (refMap.current[person.name] = el)}
      {...person}
      isHighlighted={highlightName === person.name}
    />
    <div
      className="absolute top-full left-1/2 w-px bg-gray-300"
      style={{ height: `${lineHeight * 4}px`, transform: "translateX(-50%)" }}
    />
  </div>
);

export const OrgChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const refMap = useRef<Record<string, HTMLDivElement | null>>({});
  const [zoom, setZoom] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightName, setHighlightName] = useState("");

  const allPeople: Person[] = [
    { name: "Person 1", title: "Founder & CEO" },
    { name: "Person 2", title: "Director of Finance" },
    { name: "Person 3", title: "Director of Product" },
    { name: "Person 4", title: "Senior Accountant" },
    { name: "Person 5", title: "Business Data Analyst" },
    { name: "Person 6", title: "Product Manager" },
    { name: "A1", title: "Account Assistant 1" },
    { name: "A2", title: "Account Assistant 2" },
    { name: "A3", title: "Account Intern" },
    { name: "A4", title: "Account Intern" },
    { name: "A5", title: "Account Intern" },
    { name: "B1", title: "Data Analyst 1" },
    { name: "B2", title: "Data Analyst 2" },
    { name: "B3", title: "Data Intern" },
    { name: "B4", title: "Data Intern" },
    { name: "B5", title: "Data Intern" },
    { name: "C1", title: "UX Designer" },
    { name: "C2", title: "UI Developer" },
    { name: "C3", title: "QA Tester" },
    { name: "C4", title: "QA Tester" },
    { name: "C5", title: "QA Tester" },
  ];

  const handleSelect = (name: string) => {
    setSearchTerm(name);
    setHighlightName(name);

    const el = refMap.current[name];
    if (el && chartRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(() => setHighlightName(""), 4000);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((prevZoom) =>
          Math.min(1, Math.max(0.3, prevZoom - e.deltaY * 0.003))
        );
      }
    };

    const container = chartRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  return (
    <div className="overflow-auto w-full h-full space-y-4 p-4">
      <div
        ref={chartRef}
        className="min-w-max origin-top transition-transform"
        style={{ transform: `scale(${zoom})` }}
      >
        <Command className="max-w-sm border rounded-lg">
          <CommandInput
            placeholder="Search employees..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Employees">
                {allPeople
                  .filter((p) =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((person) => (
                    <CommandItem
                      key={person.name}
                      value={person.name}
                      onSelect={() => handleSelect(person.name)}
                    >
                      {person.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </>
          )}
        </Command>

        <div className="flex flex-col items-center gap-10 relative p-4 sm:p-10">
          {/* Top Person */}
          <CardWithConnector
            person={{ name: "Person 1", title: "Founder & CEO" }}
            lineHeight={10}
            refMap={refMap}
            highlightName={highlightName}
          />

          {/* Directors */}
          <div className="relative flex justify-center gap-160 items-start">
            <div className="absolute top-0 left-1/2 w-[800px] h-px bg-gray-300 -translate-x-1/2" />
            <CardWithConnector
              person={{ name: "Person 2", title: "Director of Finance" }}
              lineHeight={10}
              refMap={refMap}
              highlightName={highlightName}
            />
            <CardWithConnector
              person={{ name: "Person 3", title: "Director of Product" }}
              lineHeight={10}
              refMap={refMap}
              highlightName={highlightName}
            />
          </div>

          {/* Managers and their teams */}
          <div className="relative flex justify-center gap-20 items-start">
            <div className="absolute top-0 left-1/2 w-[1500px] h-px bg-gray-300 -translate-x-1/2" />
            <div className="flex flex-col items-center gap-4 relative">
              <CardWithConnector
                person={{ name: "Person 4", title: "Senior Accountant" }}
                lineHeight={4}
                refMap={refMap}
                highlightName={highlightName}
              />
              <div className="relative flex gap-4">
                <div className="absolute top-0 left-1/2 w-[600px] h-px bg-gray-300 -translate-x-1/2" />

                {["A1", "A2", "A3", "A4", "A5"].map((name) => (
                  <PersonCard
                    key={name}
                    name={name}
                    title="Account Assistant"
                    ref={(el) => (refMap.current[name] = el)}
                    isHighlighted={highlightName === name}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 relative">
              <CardWithConnector
                person={{ name: "Person 5", title: "Business Data Analyst" }}
                lineHeight={4}
                refMap={refMap}
                highlightName={highlightName}
              />
              <div className="relative flex gap-4">
                <div className="absolute top-0 left-1/2 w-[600px] h-px bg-gray-300 -translate-x-1/2" />
                {["B1", "B2", "B3", "B4", "B5"].map((name) => (
                  <PersonCard
                    key={name}
                    name={name}
                    title="Data Intern"
                    ref={(el) => (refMap.current[name] = el)}
                    isHighlighted={highlightName === name}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 relative">
              <CardWithConnector
                person={{ name: "Person 6", title: "Product Manager" }}
                lineHeight={4}
                refMap={refMap}
                highlightName={highlightName}
              />
              <div className="relative flex gap-4">
                <div className="absolute top-0 left-1/2 w-[600px] h-px bg-gray-300 -translate-x-1/2" />
                {["C1", "C2", "C3", "C4", "C5"].map((name) => (
                  <PersonCard
                    key={name}
                    name={name}
                    title="QA Tester"
                    ref={(el) => (refMap.current[name] = el)}
                    isHighlighted={highlightName === name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgChart;
