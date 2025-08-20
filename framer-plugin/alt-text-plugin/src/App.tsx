import { framer, CanvasNode } from "framer-plugin"
import { useState, useEffect } from "react"
import "./App.css"

framer.showUI({
    position: "top right",
    width: 450,
    height: 600,
})

interface ImageInfo {
    nodeId: string
    url: string
    currentAltText: string | null
    generatedAltText?: string
}

export function App() {
    const [apiKey, setApiKey] = useState("")
    const [images, setImages] = useState<ImageInfo[]>([])
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isApplying, setIsApplying] = useState(false)
    const [status, setStatus] = useState("")
    const [error, setError] = useState("")

    // Load saved API key
    useEffect(() => {
        const savedKey = localStorage.getItem("openai_api_key")
        if (savedKey) setApiKey(savedKey)
    }, [])

    // Save API key
    const saveApiKey = () => {
        localStorage.setItem("openai_api_key", apiKey)
        setStatus("API key saved")
        setTimeout(() => setStatus(""), 3000)
    }

    // Analyze current page for images
    const analyzePage = async () => {
        setIsAnalyzing(true)
        setError("")
        setImages([])
        
        try {
            // Get all nodes from the current page
            const nodes = await framer.getCurrentCanvasNodes()
            const imageInfos: ImageInfo[] = []
            
            for (const node of nodes) {
                if (node.type === "Image") {
                    try {
                        // Get image URL - check various properties
                        let url = ""
                        const imageData = await node.getImageData?.()
                        if (imageData?.url) {
                            url = imageData.url
                        } else if (node.props?.src) {
                            url = node.props.src
                        }
                        
                        // Get current alt text
                        const currentAlt = node.props?.alt || null
                        
                        if (url && !currentAlt) {
                            imageInfos.push({
                                nodeId: node.id,
                                url: url,
                                currentAltText: currentAlt
                            })
                        }
                    } catch (err) {
                        console.error(`Error processing node ${node.id}:`, err)
                    }
                }
            }
            
            setImages(imageInfos)
            setStatus(`Found ${imageInfos.length} images without alt text`)
            
            // Auto-select all images
            setSelectedImages(new Set(imageInfos.map(img => img.nodeId)))
        } catch (err: any) {
            setError(`Error analyzing page: ${err.message}`)
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Generate alt text using OpenAI
    const generateAltText = async (imageUrl: string): Promise<string> => {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Generate concise, descriptive alt text for this image. The alt text should be brief but descriptive (under 125 characters), describe what the image shows, and be written in a natural way."
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageUrl,
                                    detail: "auto"
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 300
            })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || "Failed to generate alt text")
        }

        const data = await response.json()
        return data.choices[0].message.content.trim()
    }

    // Generate alt text for selected images
    const generateForSelected = async () => {
        if (!apiKey) {
            setError("Please enter your OpenAI API key")
            return
        }

        if (selectedImages.size === 0) {
            setError("Please select at least one image")
            return
        }

        setIsGenerating(true)
        setError("")
        setStatus("Generating alt text...")

        const updatedImages = [...images]
        let successCount = 0
        let errorCount = 0

        for (let i = 0; i < updatedImages.length; i++) {
            const image = updatedImages[i]
            
            if (!selectedImages.has(image.nodeId)) continue

            try {
                setStatus(`Generating alt text for image ${successCount + errorCount + 1}/${selectedImages.size}...`)
                
                // Add delay to avoid rate limits
                if (successCount > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000))
                }
                
                const altText = await generateAltText(image.url)
                updatedImages[i].generatedAltText = altText
                successCount++
                
            } catch (err: any) {
                console.error(`Error generating alt text for ${image.url}:`, err)
                errorCount++
            }
        }

        setImages(updatedImages)
        setStatus(`Generated alt text for ${successCount} images${errorCount > 0 ? `, ${errorCount} failed` : ""}`)
        setIsGenerating(false)
    }

    // Apply generated alt text to images
    const applyAltText = async () => {
        setIsApplying(true)
        setError("")
        setStatus("Applying alt text...")

        let successCount = 0
        let errorCount = 0

        try {
            for (const image of images) {
                if (!image.generatedAltText) continue

                try {
                    // Update the node with alt text
                    await framer.setAttributes(image.nodeId, {
                        alt: image.generatedAltText
                    })
                    successCount++
                } catch (err: any) {
                    console.error(`Error applying alt text to ${image.nodeId}:`, err)
                    errorCount++
                }
            }

            setStatus(`Applied alt text to ${successCount} images${errorCount > 0 ? `, ${errorCount} failed` : ""}`)
            
            // Clear the images after successful application
            if (successCount > 0) {
                setTimeout(() => {
                    setImages([])
                    setSelectedImages(new Set())
                }, 2000)
            }
        } catch (err: any) {
            setError(`Error applying alt text: ${err.message}`)
        } finally {
            setIsApplying(false)
        }
    }

    // Toggle image selection
    const toggleImageSelection = (nodeId: string) => {
        const newSelection = new Set(selectedImages)
        if (newSelection.has(nodeId)) {
            newSelection.delete(nodeId)
        } else {
            newSelection.add(nodeId)
        }
        setSelectedImages(newSelection)
    }

    // Select/deselect all
    const toggleSelectAll = () => {
        if (selectedImages.size === images.length) {
            setSelectedImages(new Set())
        } else {
            setSelectedImages(new Set(images.map(img => img.nodeId)))
        }
    }

    return (
        <main style={{ padding: "20px", height: "100%", overflowY: "auto" }}>
            <h2 style={{ marginBottom: "20px" }}>🖼️ Alt Text Generator</h2>

            {/* API Key Section */}
            <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                    OpenAI API Key
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        style={{
                            flex: 1,
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px"
                        }}
                    />
                    <button
                        onClick={saveApiKey}
                        className="framer-button-primary"
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginBottom: "20px" }}>
                <button
                    onClick={analyzePage}
                    disabled={isAnalyzing || isGenerating || isApplying}
                    className="framer-button-primary"
                    style={{ width: "100%" }}
                >
                    {isAnalyzing ? "Analyzing..." : "🔍 Find Images Without Alt Text"}
                </button>
            </div>

            {/* Status Messages */}
            {status && (
                <div style={{
                    padding: "10px",
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                    borderRadius: "4px",
                    marginBottom: "15px"
                }}>
                    {status}
                </div>
            )}

            {error && (
                <div style={{
                    padding: "10px",
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                    borderRadius: "4px",
                    marginBottom: "15px"
                }}>
                    {error}
                </div>
            )}

            {/* Images List */}
            {images.length > 0 && (
                <>
                    <div style={{ marginBottom: "15px", display: "flex", gap: "10px", alignItems: "center" }}>
                        <button
                            onClick={toggleSelectAll}
                            className="framer-button-secondary"
                        >
                            {selectedImages.size === images.length ? "Deselect All" : "Select All"}
                        </button>
                        <span style={{ fontSize: "14px", color: "#666" }}>
                            {selectedImages.size} of {images.length} selected
                        </span>
                    </div>

                    <div style={{ 
                        maxHeight: "200px", 
                        overflowY: "auto", 
                        border: "1px solid #ddd", 
                        borderRadius: "4px",
                        marginBottom: "15px"
                    }}>
                        {images.map((image) => (
                            <div
                                key={image.nodeId}
                                style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #eee",
                                    backgroundColor: selectedImages.has(image.nodeId) ? "#f0f8ff" : "white",
                                    cursor: "pointer"
                                }}
                                onClick={() => toggleImageSelection(image.nodeId)}
                            >
                                <div style={{ display: "flex", alignItems: "start", gap: "10px" }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedImages.has(image.nodeId)}
                                        onChange={() => toggleImageSelection(image.nodeId)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ marginTop: "2px" }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                                            {image.url.split('/').pop()?.substring(0, 30)}...
                                        </div>
                                        {image.generatedAltText && (
                                            <div style={{
                                                fontSize: "13px",
                                                color: "#2e7d32",
                                                padding: "4px 8px",
                                                backgroundColor: "#e8f5e9",
                                                borderRadius: "4px",
                                                marginTop: "4px"
                                            }}>
                                                ✓ {image.generatedAltText}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Generate and Apply Buttons */}
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={generateForSelected}
                            disabled={!apiKey || selectedImages.size === 0 || isGenerating || isApplying}
                            className="framer-button-primary"
                            style={{ flex: 1 }}
                        >
                            {isGenerating ? "Generating..." : "🤖 Generate Alt Text"}
                        </button>

                        <button
                            onClick={applyAltText}
                            disabled={images.filter(img => img.generatedAltText).length === 0 || isApplying}
                            className="framer-button-primary"
                            style={{ flex: 1 }}
                        >
                            {isApplying ? "Applying..." : "✅ Apply Alt Text"}
                        </button>
                    </div>
                </>
            )}
        </main>
    )
}