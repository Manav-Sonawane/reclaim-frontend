"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";
import { Button } from "../../../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/Card";
import { Upload, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function ClaimItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = use(params);

  const [description, setDescription] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [itemType, setItemType] = useState<"lost" | "found">("found"); // Default, will update

  useEffect(() => {
    const fetchItemType = async () => {
        try {
            const { data } = await api.get(`/items/${id}`);
            setItemType(data.type);
        } catch (error) {
            console.error("Failed to fetch item details", error);
        }
    };
    if (id) fetchItemType();
  }, [id]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    setSubmitting(true);
    let proofUrl = "";

    try {
      // 1. Upload Image if exists
      if (proofImage) {
        setUploading(true);
        const formData = new FormData();
        formData.append("image", proofImage);

        const { data: uploadData } = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        proofUrl = uploadData.url;
        setUploading(false);
      }

      // 2. Submit Claim
      await api.post("/claims", {
        itemId: id,
        answers: description, // Mapping description to 'answers'/message field
        proof: proofUrl,
      });

      toast.success("Claim submitted! The owner has been notified and will review your request.");
      router.push(`/items/${id}`);
    } catch (error: any) {
      console.error("Claim submission failed:", error);
      toast.error(error.response?.data?.message || "Failed to submit claim");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>Please login to claim items.</p>
        <Button onClick={() => router.push("/auth/login")} className="mt-4">
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Claim Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 {itemType === 'found' ? 'Why is this yours? (Detailed Description)' : 'Description of item found / Location'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder={itemType === 'found' ? "Describe unique marks, contents, where you lost it, etc." : "Describe where you found it, current condition, etc."}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {itemType === 'found' ? 'Proof of Ownership (Optional)' : 'Photo of Item (Optional)'}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="proof-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("proof-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Image
                </Button>
                {previewUrl && (
                  <div className="h-16 w-16 relative rounded overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Proof preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                 {itemType === 'found' ? "Upload an old photo of the item or a receipt if available." : "Upload a photo of the item you found."}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || uploading}
            >
              {submitting
                ? uploading
                  ? "Uploading..."
                  : "Submitting..."
                : itemType === 'found' ? "Submit Claim" : "Submit Retrieval Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
