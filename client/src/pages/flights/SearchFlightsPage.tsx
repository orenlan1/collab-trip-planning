import {FlightSearchForm} from "./components/FlightSearchForm.tsx";

export function SearchFlightsPage() {
    return <div>
        <div className="relative h-[400px] flex items-center justify-center">
            <div className="absolute inset-0">
                <img src="https://images.unsplash.com/photo-1527605158555-853f200063e9?q=80&w=1942&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="airplane wing image" 
                className="object-cover w-full h-full" />
            </div>

            <div className="absolute bg-white/80 rounded-2xl w-2/3">
                <div className="p-4">
                    <FlightSearchForm onSearch={(data) => console.log(data)} />
                </div>
            </div>

            

        </div>
    </div>;
}