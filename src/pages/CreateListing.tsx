import { useState } from 'react';
import { Header } from '@/components/Header';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';
import { CATEGORIES, convertGBPToSats } from '@/types/marketplace';
import { EnhancedLoginArea } from '@/components/auth/EnhancedLoginArea';

export default function CreateListing() {
  const { user } = useCurrentUser();
  const { mutate: publishEvent, isPending: isPublishing } = useNostrPublish();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    price: '',
    category: '',
    location: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create a listing',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title || !formData.price || !formData.category || !formData.location) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Upload images
      const uploadedImageTags: string[][] = [];
      for (const file of imageFiles) {
        const tags = await uploadFile(file);
        uploadedImageTags.push(...tags);
      }

      // Generate listing ID
      const listingId = `listing-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Calculate sats equivalent (approximate)
      const priceSats = convertGBPToSats(price);

      // Build tags
      const tags: string[][] = [
        ['d', listingId],
        ['title', formData.title],
        ['price', price.toString(), 'GBP'],
        ['price_sats', priceSats.toString()],
        ['t', formData.category],
        ['location', formData.location],
        ['status', 'active'],
        ['published_at', Math.floor(Date.now() / 1000).toString()],
      ];

      if (formData.summary) {
        tags.push(['summary', formData.summary]);
      }

      // Add uploaded images
      uploadedImageTags.forEach((tag) => {
        tags.push(['image', tag[1]]);
      });

      // Publish event
      publishEvent(
        {
          kind: 30402,
          content: formData.description,
          tags,
        },
        {
          onSuccess: () => {
            toast({
              title: 'Listing Created!',
              description: 'Your item has been listed successfully',
            });
            navigate(`/listing/${listingId}`);
          },
          onError: (error) => {
            toast({
              title: 'Failed to Create Listing',
              description: error.message,
              variant: 'destructive',
            });
          },
        }
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create listing',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create a Listing</h1>
          <p className="text-muted-foreground">
            List your item for sale on TrustMarket. Fill in the details below.
          </p>
        </div>

        {!user ? (
          <div className="flex justify-center">
            <EnhancedLoginArea />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Tell buyers about your item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Canon EOS R6 Camera - Excellent Condition"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Short Summary</Label>
                  <Input
                    id="summary"
                    placeholder="Brief one-line description"
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your item (supports Markdown)"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    You can use Markdown formatting for headers, lists, bold, italic, etc.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
                <CardDescription>Upload up to 5 photos of your item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <img
                        src={img}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Add clear, well-lit photos. The first image will be used as the main thumbnail.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Pricing & Category */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Price (GBP) <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        £
                      </span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    {formData.price && parseFloat(formData.price) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        ≈ {new Intl.NumberFormat('en-GB').format(convertGBPToSats(parseFloat(formData.price)))} sats
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Manchester, SW1A 1AA"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your city or postcode. This helps buyers find local items.
                  </p>
                </div>

                <Alert className="bg-accent/30 border-primary/20">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Platform fee: 2% on successful transactions. Payments are held in escrow for buyer protection.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" size="lg" className="flex-1" disabled={isPublishing || isUploading}>
                {isPublishing ? 'Publishing...' : isUploading ? 'Uploading Images...' : 'Create Listing'}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => navigate('/')}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
