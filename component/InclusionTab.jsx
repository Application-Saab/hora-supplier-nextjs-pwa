
import React from "react";

const HIDDEN_TABS = [
    "Raw Photos",
    "Raw Video",
    "Album",
];

export default function InclusionTabs({
    inclusions = {},
    activeTab,
    setActiveTab,
    disabled = false,
}) {
    const visibleTabs = Object.entries(inclusions)
        .filter(
            ([name, value]) =>
                value === true && !HIDDEN_TABS.includes(name)
        )
        .map(([name]) => name);
    if (!visibleTabs.length) return null;

    return (
        <div className="category-tabs-scroll">
            {visibleTabs.map((cat) => (
                <button
                    key={cat}
                    type="button"
                    disabled={disabled}
                    className={`common-custom-button primary categories-Button ${activeTab === cat ? "active" : ""
                        }`}
                    onClick={() => setActiveTab(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
