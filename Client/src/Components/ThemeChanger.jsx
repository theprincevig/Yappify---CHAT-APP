export default function ThemeChanger({theme, setTheme}) {
    function handleClickable(type) {
        if (type === "dark") {
            setTheme("dark");
        } else {
            setTheme("light");
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl myfont-kaushan tracking-wider font-semibold mb-3">Appearence</h3>
            <div className="w-full max-w-md border-y border-gray-300/10 font-light rounded-xl p-4">
                <div 
                    className="flex items-center justify-between px-2"
                    onClick={() => handleClickable("light")}
                >
                    <label className="text-lg font-[Poppins]">Default</label>
                    <input
                        type="radio"
                        name="theme"
                        className="radio radio-primary radio-xs"
                        value="default"                                        
                        onChange={() => setTheme("light")}
                        defaultChecked
                    />
                </div>
                <div 
                    className="flex items-center justify-between px-2"
                    onClick={() => handleClickable("light")}
                >
                    <label className="text-lg font-[Poppins]">Light</label>
                    <input
                        type="radio"
                        name="theme"
                        className="radio radio-primary radio-xs"
                        value="light"
                        checked={theme === "light"}
                        onChange={() => setTheme("light")}                                        
                    />
                </div>
                <div 
                    className="flex items-center justify-between px-2"
                    onClick={() => handleClickable("dark")}
                >
                    <label className="text-lg font-[Poppins]">Dark</label>
                    <input
                        type="radio"
                        name="theme"
                        className="radio radio-primary radio-xs"
                        value="dark"
                        checked={theme === "dark"}
                        onChange={() => setTheme("dark")}
                    />
                </div>
            </div>
        </div>
    );
}