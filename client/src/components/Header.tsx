import { FileText } from "lucide-react";
import SessionTimer from "./SessionTimer";
import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-gray-900">RobotLawyer</h1>
          </div>
        </Link>
        <div className="flex items-center space-x-4">
          <SessionTimer />
        </div>
      </div>
    </header>
  );
}
