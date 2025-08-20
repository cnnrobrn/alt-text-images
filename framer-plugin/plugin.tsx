import { framer } from "framer-plugin"
import { useState, useEffect } from "react"

interface ImageWithoutAlt {
    url: string
    selector: string
    element_id: string
    current_alt: string | null
}

interface GeneratedAltText {
    url: string
    alt_text: string
}

export function AltTextGenerator() {
    const [apiUrl, setApiUrl] = useState("http://localhost:5000")
    const [apiKey, setApiKey] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [images, setImages] = useState<ImageWithoutAlt[]>([])
    const [generatedAltTexts, setGeneratedAltTexts] = useState<Map<string, string>>(new Map())
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Load saved settings
    useEffect(() => {
        const savedApiUrl = localStorage.getItem("alttext_api_url")
        const savedApiKey = localStorage.getItem("alttext_api_key")
        
        if (savedApiUrl) setApiUrl(savedApiUrl)
        if (savedApiKey) setApiKey(savedApiKey)
    }, [])

    // Save settings when they change
    const saveSettings = () => {
        localStorage.setItem("alttext_api_url", apiUrl)
        localStorage.setItem("alttext_api_key", apiKey)
        setSuccess("Settings saved successfully")
        setTimeout(() => setSuccess(null), 3000)
    }

    // Analyze current page for images without alt text
    const analyzeCurrentPage = async () => {
        setIsAnalyzing(true)
        setError(null)
        setImages([])

        try {
            // Get all image nodes from the current canvas
            const imageNodes = await framer.getImageNodes()
            const imagesWithoutAlt: ImageWithoutAlt[] = []

            for (const node of imageNodes) {
                const altText = await node.getAltText()
                if (!altText) {
                    const imageUrl = await node.getImageUrl()
                    imagesWithoutAlt.push({
                        url: imageUrl,
                        selector: `#${node.id}`,
                        element_id: node.id,
                        current_alt: null
                    })
                }
            }

            setImages(imagesWithoutAlt)
            
            if (imagesWithoutAlt.length === 0) {
                setSuccess("All images have alt text!")
            } else {
                setSuccess(`Found ${imagesWithoutAlt.length} images without alt text`)
            }
        } catch (err) {
            setError(`Error analyzing page: ${err.message}`)
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Toggle image selection
    const toggleImageSelection = (url: string) => {
        const newSelection = new Set(selectedImages)
        if (newSelection.has(url)) {
            newSelection.delete(url)
        } else {
            newSelection.add(url)
        }
        setSelectedImages(newSelection)
    }

    // Select/deselect all images
    const toggleAllImages = () => {
        if (selectedImages.size === images.length) {
            setSelectedImages(new Set())
        } else {
            setSelectedImages(new Set(images.map(img => img.url)))
        }
    }

    // Generate alt text for selected images
    const generateAltText = async () => {
        if (selectedImages.size === 0) {
            setError("Please select at least one image")
            return
        }

        setIsGenerating(true)
        setError(null)

        try {
            const imagesToProcess = images.filter(img => selectedImages.has(img.url))
            
            const response = await fetch(`${apiUrl}/generate-batch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey
                },
                body: JSON.stringify({
                    images: imagesToProcess.map(img => ({
                        url: img.url,
                        context: `Framer element ID: ${img.element_id}`
                    }))
                })
            })

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`)
            }

            const data = await response.json()
            const newAltTexts = new Map(generatedAltTexts)
            
            for (const result of data.results) {
                newAltTexts.set(result.url, result.alt_text)
            }
            
            setGeneratedAltTexts(newAltTexts)
            setSuccess(`Generated alt text for ${data.results.length} images`)
        } catch (err) {
            setError(`Error generating alt text: ${err.message}`)
        } finally {
            setIsGenerating(false)
        }
    }

    // Apply generated alt text to Framer elements
    const applyAltText = async () => {
        let appliedCount = 0
        setError(null)

        try {
            for (const image of images) {
                const altText = generatedAltTexts.get(image.url)
                if (altText) {
                    // Find the node and update its alt text
                    const node = await framer.getNodeById(image.element_id)
                    if (node && node.type === "Image") {
                        await node.setAltText(altText)
                        appliedCount++
                    }
                }
            }

            setSuccess(`Applied alt text to ${appliedCount} images`)
            
            // Clear the generated texts after applying
            setGeneratedAltTexts(new Map())
            setSelectedImages(new Set())
            
            // Re-analyze to update the list
            await analyzeCurrentPage()
        } catch (err) {
            setError(`Error applying alt text: ${err.message}`)
        }
    }

    // Export results as JSON
    const exportResults = () => {
        const results = images.map(img => ({
            url: img.url,
            element_id: img.element_id,
            generated_alt_text: generatedAltTexts.get(img.url) || ""
        }))

        const dataStr = JSON.stringify(results, null, 2)
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
        
        const exportLink = document.createElement("a")
        exportLink.setAttribute("href", dataUri)
        exportLink.setAttribute("download", "alt_text_results.json")
        document.body.appendChild(exportLink)
        exportLink.click()
        document.body.removeChild(exportLink)
    }

    return (
        <div style={{ padding: "20px", fontFamily: "Inter, sans-serif" }}>
            <h2 style={{ marginBottom: "20px" }}>Alt Text Generator</h2>
            
            {/* Settings Section */}
            <div style={{ marginBottom: "30px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
                <h3 style={{ marginBottom: "15px" }}>Settings</h3>
                <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
                        API Server URL:
                    </label>
                    <input
                        type="text"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px"
                        }}
                        placeholder="http://localhost:5000"
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
                        API Key:
                    </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px"
                        }}
                        placeholder="Enter your API key"
                    />
                </div>
                <button
                    onClick={saveSettings}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#0099ff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Save Settings
                </button>
            </div>

            {/* Analysis Section */}
            <div style={{ marginBottom: "20px" }}>
                <button
                    onClick={analyzeCurrentPage}
                    disabled={isAnalyzing}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: isAnalyzing ? "#ccc" : "#0099ff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isAnalyzing ? "not-allowed" : "pointer",
                        marginRight: "10px"
                    }}
                >
                    {isAnalyzing ? "Analyzing..." : "Analyze Current Page"}
                </button>
            </div>

            {/* Status Messages */}
            {error && (
                <div style={{
                    padding: "10px",
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                    borderRadius: "4px",
                    marginBottom: "20px"
                }}>
                    {error}
                </div>
            )}
            
            {success && (
                <div style={{
                    padding: "10px",
                    backgroundColor: "#e8f5e9",
                    color: "#2e7d32",
                    borderRadius: "4px",
                    marginBottom: "20px"
                }}>
                    {success}
                </div>
            )}

            {/* Images List */}
            {images.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ marginBottom: "15px" }}>
                        Images Without Alt Text ({images.length})
                    </h3>
                    
                    <div style={{ marginBottom: "10px" }}>
                        <button
                            onClick={toggleAllImages}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: "#f0f0f0",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                cursor: "pointer",
                                marginRight: "10px"
                            }}
                        >
                            {selectedImages.size === images.length ? "Deselect All" : "Select All"}
                        </button>
                        
                        <button
                            onClick={generateAltText}
                            disabled={isGenerating || selectedImages.size === 0}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: isGenerating || selectedImages.size === 0 ? "#ccc" : "#4caf50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: isGenerating || selectedImages.size === 0 ? "not-allowed" : "pointer",
                                marginRight: "10px"
                            }}
                        >
                            {isGenerating ? "Generating..." : `Generate Alt Text (${selectedImages.size} selected)`}
                        </button>
                        
                        {generatedAltTexts.size > 0 && (
                            <>
                                <button
                                    onClick={applyAltText}
                                    style={{
                                        padding: "6px 12px",
                                        backgroundColor: "#ff9800",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        marginRight: "10px"
                                    }}
                                >
                                    Apply Alt Text
                                </button>
                                
                                <button
                                    onClick={exportResults}
                                    style={{
                                        padding: "6px 12px",
                                        backgroundColor: "#607d8b",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Export Results
                                </button>
                            </>
                        )}
                    </div>
                    
                    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                        {images.map((image, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: "10px",
                                    marginBottom: "10px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    backgroundColor: selectedImages.has(image.url) ? "#e3f2fd" : "white"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "start", gap: "10px" }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedImages.has(image.url)}
                                        onChange={() => toggleImageSelection(image.url)}
                                        style={{ marginTop: "5px" }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ marginBottom: "5px" }}>
                                            <strong>Element ID:</strong> {image.element_id}
                                        </div>
                                        <div style={{ marginBottom: "5px", fontSize: "12px", color: "#666" }}>
                                            <strong>URL:</strong> {image.url.substring(0, 50)}...
                                        </div>
                                        {generatedAltTexts.has(image.url) && (
                                            <div style={{
                                                marginTop: "10px",
                                                padding: "8px",
                                                backgroundColor: "#f0f8ff",
                                                borderRadius: "4px"
                                            }}>
                                                <strong>Generated Alt Text:</strong><br />
                                                {generatedAltTexts.get(image.url)}
                                            </div>
                                        )}
                                    </div>
                                    <img
                                        src={image.url}
                                        alt="Preview"
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                            objectFit: "cover",
                                            borderRadius: "4px"
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// Register the plugin with Framer
framer.showUI({
    title: "Alt Text Generator",
    width: 400,
    height: 600,
    resizable: true
})