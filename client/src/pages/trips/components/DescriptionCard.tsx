import { IoDocumentTextOutline } from "react-icons/io5";

export function DescriptionCard({ description }: { description: string }) {
    return (
        <div className="border-1 rounded-xl py-3 h-full bg-white/80 shadow-sm">
            <div className="flex px-4 gap-3 items-center">
                <IoDocumentTextOutline className="text-xl text-indigo-500" />
                <h1 className="font-semibold text-xl">Description</h1>
            </div>
            <div className="relative p-4">
                <textarea
                    className="w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm bg-white/90 border-neutral-200/60 border rounded-lg pt-3 pr-4 pb-3 pl-8"
                    value={description}
                    rows={4}
                />
            </div>
        </div>
    );
}
