import {
    BarChart3,
    Telescope,
    ScanSearch,
    Orbit,
    Info,
} from "lucide-react";


const navigation = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: BarChart3,
    },
    {
        id: "analyze",
        label: "Analyze",
        icon: ScanSearch,
    },
    {
        id: "candidates",
        label: "Candidates",
        icon: Orbit,
    },
    {
        id: "about",
        label: "About",
        icon: Info,
    },
];


export default function AppShell({
    page,
    setPage,
    children,
}) {

    return (
        <div className="
            min-h-screen
            bg-[#f7f8fc]
            text-slate-900
        ">

            {/* =========================
                TOP BAR
            ========================== */}

            <header className="
                fixed
                left-0
                right-0
                top-0
                z-50
                h-[72px]
                border-b
                border-slate-200/80
                bg-white/85
                backdrop-blur-xl
            ">

                <div className="
                    flex
                    h-full
                    items-center
                    justify-between
                    px-5
                    md:px-8
                ">

                    {/* Brand */}

                    <button
                        onClick={() => setPage("dashboard")}
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <div className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-br
                            from-violet-600
                            to-indigo-600
                            text-white
                            shadow-lg
                            shadow-violet-500/20
                        ">

                            <Telescope
                                size={20}
                            />

                        </div>

                        <div className="
                            hidden
                            sm:block
                            text-left
                        ">

                            <div className="
                                text-sm
                                font-bold
                                tracking-[0.2em]
                            ">
                                DRISHTI
                            </div>

                            <div className="
                                text-[9px]
                                uppercase
                                tracking-[0.2em]
                                text-slate-400
                            ">
                                Exoplanet Intelligence
                            </div>

                        </div>

                    </button>


                    {/* Status */}

                    <div className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-emerald-200
                        bg-emerald-50
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-emerald-700
                    ">

                        <span className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-emerald-500
                        "/>

                        System Ready

                    </div>

                </div>

            </header>


            {/* =========================
                SIDEBAR
            ========================== */}

            <aside className="
                fixed
                bottom-0
                left-0
                top-[72px]
                z-40
                hidden
                w-60
                border-r
                border-slate-200/80
                bg-white
                lg:block
            ">

                <div className="
                    flex
                    h-full
                    flex-col
                    px-4
                    py-6
                ">

                    <p className="
                        mb-3
                        px-3
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.2em]
                        text-slate-400
                    ">
                        Observatory
                    </p>


                    <nav className="
                        space-y-1
                    ">

                        {navigation.map((item) => {

                            const Icon = item.icon;

                            const active =
                                page === item.id;

                            return (

                                <button
                                    key={item.id}
                                    onClick={() =>
                                        setPage(item.id)
                                    }
                                    className={`
                                        flex
                                        w-full
                                        items-center
                                        gap-3
                                        rounded-xl
                                        px-3
                                        py-3
                                        text-sm
                                        font-medium
                                        transition
                                        ${
                                            active
                                                ? `
                                                    bg-violet-50
                                                    text-violet-700
                                                `
                                                : `
                                                    text-slate-500
                                                    hover:bg-slate-50
                                                    hover:text-slate-900
                                                `
                                        }
                                    `}
                                >

                                    <Icon
                                        size={18}
                                        strokeWidth={
                                            active ? 2 : 1.7
                                        }
                                    />

                                    {item.label}

                                    {active && (
                                        <span className="
                                            ml-auto
                                            h-1.5
                                            w-1.5
                                            rounded-full
                                            bg-violet-500
                                        " />
                                    )}

                                </button>

                            );

                        })}

                    </nav>


                    {/* Bottom information */}

                    <div className="
                        mt-auto
                        rounded-2xl
                        border
                        border-violet-100
                        bg-gradient-to-br
                        from-violet-50
                        to-indigo-50
                        p-4
                    ">

                        <p className="
                            text-xs
                            font-semibold
                            text-slate-700
                        ">
                            Discovery Engine
                        </p>

                        <p className="
                            mt-1
                            text-[11px]
                            leading-5
                            text-slate-500
                        ">
                            Signal processing and
                            machine learning pipeline
                            ready for analysis.
                        </p>

                    </div>

                </div>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================== */}

            <main className="
                min-h-screen
                pt-[72px]
                lg:pl-60
            ">

                {children}

            </main>

        </div>
    );
}