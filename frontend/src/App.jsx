import { useState } from "react";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import About from "./pages/About";
import Analyze from "./pages/Analyze";

import AppShell
    from "./components/layout/AppShell";


export default function App() {

    const [page, setPage] =
        useState("home");

    const [selectedAnalysisId, setSelectedAnalysisId] =
        useState(null);


    if (page === "home") {

        return (
            <Home
                onExplore={() =>
                    setPage("dashboard")
                }
            />
        );
    }


    return (
        <AppShell
            page={page}
            setPage={setPage}
        >

            {page === "dashboard" && (
                <Dashboard />
            )}

            {page === "candidates" && (
                <Candidates
                    setPage={setPage}
                    setSelectedAnalysisId={
                        setSelectedAnalysisId
                    }
                />
            )}

            {page === "about" && (
                <About />
            )}

            {page === "analyze" && (
                <Analyze
                    analysisId={selectedAnalysisId}
                />
            )}

        </AppShell>
    );
}