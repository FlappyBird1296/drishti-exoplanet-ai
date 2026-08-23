const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";


export async function analyzeLightCurve(file) {

    const formData = new FormData();

    formData.append("file", file);


    const response = await fetch(
        `${API_BASE_URL}/api/analyze`,
        {
            method: "POST",
            body: formData,
        }
    );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result.detail ||
            "Analysis failed."
        );
    }


    return result;
}