import { useTripStore } from "@/stores/tripStore";

export function ChatHeader() {
  const tripTitle = useTripStore(state => state.title);

  return (
    <div className="border-b bg-white px-4 py-3">
      <div className="flex items-center">
        <div>
          <h3 className="font-semibold text-gray-900">
            {tripTitle || 'Trip Chat'}
          </h3>
          <p className="text-sm text-gray-500">
            Trip Discussion
          </p>
        </div>
      </div>
    </div>
  );
}