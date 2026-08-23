import {
    ArrowRight,
    Sparkles,
    Telescope,
    Activity,
    Crosshair,
    Brain,
    Mouse
} from "lucide-react";

import SpaceScene
    from "../components/three/SpaceScene";


export default function Home({
    onExplore
}) {
    return (
        <main className="
            relative
            min-h-screen
            overflow-hidden
            bg-[#03050d]
            text-white
        ">

            {/* =================================================
                BACKGROUND
            ================================================= */}

            <div className="
                pointer-events-none
                absolute
                inset-0
                z-0
                bg-[radial-gradient(circle_at_68%_48%,rgba(83,64,120,0.16),transparent_38%)]
            " />

            <div className="
                pointer-events-none
                absolute
                inset-0
                z-0
                bg-[radial-gradient(circle_at_20%_65%,rgba(48,45,110,0.12),transparent_35%)]
            " />

            {/* Subtle cinematic vignette */}

            <div className="
                pointer-events-none
                absolute
                inset-0
                z-[2]
                bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.45)_100%)]
            " />


            {/* =================================================
                3D ASTRONOMY
            ================================================= */}

            <SpaceScene />


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <header className="
                absolute
                left-0
                right-0
                top-0
                z-20
                flex
                items-center
                justify-between
                px-7
                py-6
                md:px-12
                md:py-7
            ">

                {/* Brand */}

                <div className="
                    flex
                    items-center
                    gap-3
                ">

                    <div className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-violet-500/50
                        bg-violet-500/[0.08]
                        shadow-[0_0_30px_rgba(124,92,255,0.12)]
                    ">

                        <Telescope
                            size={23}
                            strokeWidth={1.7}
                            className="
                                text-violet-300
                            "
                        />

                    </div>


                    <div>

                        <div className="
                            text-xl
                            font-semibold
                            tracking-[0.22em]
                        ">
                            DRISHTI
                        </div>

                        <div className="
                            mt-0.5
                            text-[9px]
                            uppercase
                            tracking-[0.3em]
                            text-violet-300/55
                        ">
                            Exoplanet Intelligence
                        </div>

                    </div>

                </div>


                {/* Top-right status */}

                <div className="
                    flex
                    items-center
                    gap-2.5
                    rounded-full
                    border
                    border-violet-400/30
                    bg-violet-500/[0.05]
                    px-5
                    py-2.5
                    text-xs
                    uppercase
                    tracking-[0.08em]
                    text-white/70
                    backdrop-blur-xl
                ">

                    <span className="
                        h-2
                        w-2
                        rounded-full
                        bg-emerald-400
                        shadow-[0_0_12px_rgba(52,211,153,0.9)]
                    " />

                    AI × Astronomy

                </div>

            </header>


            {/* =================================================
                HERO CONTENT
            ================================================= */}

            <section className="
                relative
                z-10
                flex
                min-h-screen
                items-center
                px-7
                pt-28
                md:px-12
                lg:w-[52%]
                lg:pt-24
            ">

                <div className="
                    w-full
                    max-w-xl
                ">

                    {/* Eyebrow */}

                    <div className="
                        mb-7
                        mt-15
                        flex
                        w-fit
                        items-center
                        gap-2.5
                        rounded-full
                        border
                        border-violet-500/40
                        bg-violet-500/[0.07]
                        px-4
                        py-2.5
                        text-xs
                        font-medium
                        uppercase
                        tracking-[0.08em]
                        text-white/85
                        backdrop-blur-xl
                    ">

                        <Sparkles
                            size={14}
                            className="
                                text-amber-300
                            "
                        />

                        AI-powered discovery

                    </div>


                    {/* Main heading */}

                    <h1 className="
                        text-5xl
                        font-semibold
                        leading-[0.98]
                        tracking-[-0.045em]
                        sm:text-6xl
                        md:text-7xl
                        lg:text-[5rem]
                    ">

                        <span className="
                            block
                            text-white
                        ">
                            See Beyond.
                        </span>

                        <span className="
                            mt-1
                            block
                            bg-gradient-to-r
                            from-violet-400
                            via-indigo-400
                            to-blue-400
                            bg-clip-text
                            text-transparent
                        ">
                            Discover More.
                        </span>

                    </h1>


                    {/* Description */}

                    <p className="
                        mt-7
                        max-w-md
                        text-base
                        leading-7
                        text-slate-300/75
                        md:text-lg
                        md:leading-8
                    ">

                        Drishti analyzes stellar light
                        curves with advanced signal
                        processing and machine learning
                        to identify promising exoplanet
                        candidates.

                    </p>


                    {/* CTA */}

                    <button
                        onClick={onExplore}
                        className="
                            group
                            mt-8
                            flex
                            items-center
                            gap-8
                            rounded-lg
                            bg-gradient-to-r
                            from-violet-600
                            to-indigo-600
                            px-7
                            py-4
                            text-sm
                            font-semibold
                            shadow-[0_12px_45px_rgba(91,64,220,0.35)]
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:shadow-[0_18px_55px_rgba(91,64,220,0.48)]
                        "
                    >

                        Start Exploring

                        <ArrowRight
                            size={19}
                            className="
                                transition-transform
                                duration-300
                                group-hover:translate-x-1
                            "
                        />

                    </button>


                    {/* =================================================
                        TECHNOLOGY HIGHLIGHTS
                    ================================================= */}

                    <div className="
                        mt-12
                        flex
                        items-center
                        gap-4
                        whitespace-nowrap
                    ">

                        {/* TESS */}

                        <div className="
                            flex
                            items-center
                            gap-3
                            pr-4
                        ">

                            <div className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-violet-500/60
                                bg-violet-500/[0.06]
                            ">

                                <Activity
                                    size={19}
                                    className="
                                        text-violet-300
                                    "
                                />

                            </div>

                            <div>

                                <p className="
                                    text-sm
                                    font-medium
                                    text-white
                                ">
                                    TESS Data
                                </p>

                                <p className="
                                    mt-0.5
                                    text-xs
                                    text-white/40
                                ">
                                    Real observations
                                </p>

                            </div>

                        </div>


                        <div className="
                            hidden
                            h-9
                            w-px
                            bg-white/15
                            md:block
                        " />


                        {/* BLS */}

                        <div className="
                            flex
                            items-center
                            gap-3
                            px-4
                        ">

                            <div className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-violet-500/60
                                bg-violet-500/[0.06]
                            ">

                                <Crosshair
                                    size={19}
                                    className="
                                        text-violet-300
                                    "
                                />

                            </div>

                            <div>

                                <p className="
                                    text-sm
                                    font-medium
                                    text-white
                                ">
                                    BLS Detection
                                </p>

                                <p className="
                                    mt-0.5
                                    text-xs
                                    text-white/40
                                ">
                                    Signal extraction
                                </p>

                            </div>

                        </div>


                        <div className="
                            hidden
                            h-9
                            w-px
                            bg-white/15
                            md:block
                        " />


                        {/* ML */}

                        <div className="
                            flex
                            items-center
                            gap-3
                            px-4
                        ">

                            <div className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-violet-500/60
                                bg-violet-500/[0.06]
                            ">

                                <Brain
                                    size={19}
                                    className="
                                        text-violet-300
                                    "
                                />

                            </div>

                            <div>

                                <p className="
                                    text-sm
                                    font-medium
                                    text-white
                                ">
                                    Machine Learning
                                </p>

                                <p className="
                                    mt-0.5
                                    text-xs
                                    text-white/40
                                ">
                                    Smart classification
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                SCROLL INDICATOR
            ================================================= */}

            <div className="
                absolute
                bottom-8
                left-1/2
                z-20
                hidden
                -translate-x-1/2
                flex-col
                items-center
                gap-3
                text-white/45
                md:flex
            ">

                <div className="
                    flex
                    h-10
                    w-6
                    items-start
                    justify-center
                    rounded-full
                    border
                    border-white/35
                    pt-2
                ">

                    <div className="
                        h-1.5
                        w-1.5
                        animate-bounce
                        rounded-full
                        bg-white/70
                    " />

                </div>

                <span className="
                    text-[11px]
                    tracking-wide
                ">
                    Scroll to explore
                </span>

                <span className="
                    text-white/30
                ">
                    ↓
                </span>

            </div>


            {/* Bottom glow */}

            <div className="
                pointer-events-none
                absolute
                bottom-0
                left-0
                right-0
                z-20
                h-px
                bg-gradient-to-r
                from-transparent
                via-violet-500/40
                to-transparent
            " />

        </main>
    );
}