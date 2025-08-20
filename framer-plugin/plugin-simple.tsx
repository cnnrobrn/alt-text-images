import { framer } from "framer-plugin"
import { useState, useEffect } from "react"

// Import the generated alt text results
import altTextResults from "../alt_text_results.json"

export function AltTextApplier() {
    const [results, setResults] = useState<any[]>([])
    const [applied, setApplied] = useState<Set<string>>(new Set())
    const [status, setStatus] = useState<string>("")
    const [isApplying, setIsApplying] = useState(false)

    useEffect(() => {
        // Load the alt text results
        if (altTextResults && altTextResults.results) {
            // Filter out invalid alt texts
            const validResults = altTextResults.results.filter((r: any) => {
                const alt = r.generated_alt_text;
                return alt && 
                       !alt.startsWith("Please") && 
                       !alt.startsWith("I'm unable") &&
                       !alt.startsWith("I can't") &&
                       !alt.startsWith("Sure!");
            });
            setResults(validResults);
            setStatus(`Loaded ${validResults.length} valid alt texts from generation results`);
        }
    }, [])

    const applyAltText = async () => {
        setIsApplying(true);
        setStatus("Applying alt text to images...");
        
        let successCount = 0;
        let failCount = 0;

        try {
            // Get all image nodes in the current page
            const selection = await framer.getSelection();
            const nodes = selection.length > 0 ? selection : await framer.getNodes();
            
            for (const node of nodes) {
                if (node.type === "Image") {
                    const imageUrl = await node.getImageUrl();
                    
                    // Find matching alt text from results
                    const match = results.find((r: any) => {
                        // Match by URL or partial URL match
                        return imageUrl && (
                            imageUrl.includes(r.url) || 
                            r.url.includes(imageUrl) ||
                            imageUrl.split('/').pop() === r.url.split('/').pop()
                        );
                    });
                    
                    if (match && !applied.has(node.id)) {
                        try {
                            await node.setPluginData("altText", match.generated_alt_text);
                            // Try to set alt text property if available
                            if (node.setAltText) {
                                await node.setAltText(match.generated_alt_text);
                            }
                            setApplied(prev => new Set(prev).add(node.id));
                            successCount++;
                            setStatus(`Applied alt text to ${successCount} images...`);
                        } catch (err) {
                            console.error(`Failed to apply alt text to node ${node.id}:`, err);
                            failCount++;
                        }
                    }
                }
            }
            
            setStatus(`✅ Complete! Applied ${successCount} alt texts, ${failCount} failed`);
        } catch (error) {
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setIsApplying(false);
        }
    };

    const applyToSelection = async () => {
        setIsApplying(true);
        setStatus("Applying to selected images...");
        
        try {
            const selection = await framer.getSelection();
            
            if (selection.length === 0) {
                setStatus("⚠️ Please select some images first");
                setIsApplying(false);
                return;
            }
            
            let successCount = 0;
            
            for (const node of selection) {
                if (node.type === "Image") {
                    const imageUrl = await node.getImageUrl();
                    
                    const match = results.find((r: any) => {
                        return imageUrl && (
                            imageUrl.includes(r.url) || 
                            r.url.includes(imageUrl) ||
                            imageUrl.split('/').pop() === r.url.split('/').pop()
                        );
                    });
                    
                    if (match) {
                        await node.setPluginData("altText", match.generated_alt_text);
                        if (node.setAltText) {
                            await node.setAltText(match.generated_alt_text);
                        }
                        successCount++;
                    }
                }
            }
            
            setStatus(`✅ Applied alt text to ${successCount} selected images`);
        } catch (error) {
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Inter, sans-serif" }}>
            <h2 style={{ marginBottom: "20px" }}>Apply Generated Alt Text</h2>
            
            <div style={{
                padding: "15px",
                backgroundColor: "#f0f8ff",
                borderRadius: "8px",
                marginBottom: "20px"
            }}>
                <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
                    📊 Alt Text Results Loaded
                </p>
                <p style={{ margin: "0", fontSize: "14px" }}>
                    {results.length} valid alt texts ready to apply
                </p>
            </div>

            {status && (
                <div style={{
                    padding: "10px",
                    backgroundColor: status.includes("✅") ? "#e8f5e9" : 
                                     status.includes("❌") ? "#ffebee" : 
                                     status.includes("⚠️") ? "#fff3e0" : "#f5f5f5",
                    borderRadius: "4px",
                    marginBottom: "20px",
                    fontSize: "14px"
                }}>
                    {status}
                </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button
                    onClick={applyToSelection}
                    disabled={isApplying || results.length === 0}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: isApplying ? "#ccc" : "#0099ff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isApplying ? "not-allowed" : "pointer",
                        flex: 1
                    }}
                >
                    Apply to Selected Images
                </button>
                
                <button
                    onClick={applyAltText}
                    disabled={isApplying || results.length === 0}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: isApplying ? "#ccc" : "#4caf50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isApplying ? "not-allowed" : "pointer",
                        flex: 1
                    }}
                >
                    Apply to All Images
                </button>
            </div>

            <div style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "10px"
            }}>
                <h4 style={{ marginTop: 0 }}>Available Alt Texts:</h4>
                {results.map((result: any, index: number) => (
                    <div key={index} style={{
                        padding: "8px",
                        borderBottom: "1px solid #eee",
                        fontSize: "12px"
                    }}>
                        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                            {result.url.split('/').pop()}
                        </div>
                        <div style={{ color: "#666" }}>
                            {result.generated_alt_text}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Register the plugin
framer.showUI({
    title: "Apply Alt Text",
    width: 400,
    height: 500,
    resizable: true
})