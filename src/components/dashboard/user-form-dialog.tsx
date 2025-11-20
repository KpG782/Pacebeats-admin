"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserFormData } from "@/lib/types/user";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSave: (data: UserFormData) => void;
}

const GENRES = [
  "Electronic",
  "Hip-Hop",
  "Rock",
  "Jazz",
  "Classical",
  "Ambient",
  "Lo-fi",
  "Pop",
];

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: UserFormDialogProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    username: "",
    avatar_url: "",
    gender: undefined,
    age: undefined,
    height: undefined,
    height_unit: "cm",
    weight: undefined,
    weight_unit: "kg",
    running_experience: undefined,
    pace_band: "",
    preferred_genres: [],
    status: "active",
  });

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url,
        gender: user.gender,
        age: user.age,
        height: user.height,
        height_unit: user.height_unit || "cm",
        weight: user.weight,
        weight_unit: user.weight_unit || "kg",
        running_experience: user.running_experience,
        pace_band: user.pace_band || "",
        preferred_genres: user.preferred_genres || [],
        status: user.status,
      });
      setSelectedGenres(user.preferred_genres || []);
    } else {
      // Reset form for new user
      setFormData({
        email: "",
        username: "",
        avatar_url: "",
        gender: undefined,
        age: undefined,
        height: undefined,
        height_unit: "cm",
        weight: undefined,
        weight_unit: "kg",
        running_experience: undefined,
        pace_band: "",
        preferred_genres: [],
        status: "active",
      });
      setSelectedGenres([]);
    }
  }, [user, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      preferred_genres: selectedGenres,
    });
  };

  const addGenre = (genre: string) => {
    if (genre && !selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre]);
    }
    setGenreInput("");
  };

  const removeGenre = (genre: string) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Update user information and preferences"
              : "Create a new user account with details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  placeholder="johndoe_runner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                type="url"
                value={formData.avatar_url}
                onChange={(e) =>
                  setFormData({ ...formData, avatar_url: e.target.value })
                }
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(
                  value: "active" | "inactive" | "suspended" | "deleted"
                ) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Profile Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(
                    value: "male" | "female" | "other" | "prefer_not_to_say"
                  ) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      age: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="25"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <div className="flex gap-2">
                  <Input
                    id="height"
                    type="number"
                    value={formData.height || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        height: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="170"
                    className="flex-1"
                  />
                  <Select
                    value={formData.height_unit}
                    onValueChange={(value: "cm" | "ft") =>
                      setFormData({ ...formData, height_unit: value })
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="ft">ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <div className="flex gap-2">
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="70"
                    className="flex-1"
                  />
                  <Select
                    value={formData.weight_unit}
                    onValueChange={(value: "kg" | "lbs") =>
                      setFormData({ ...formData, weight_unit: value })
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lbs">lbs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Running Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Running Preferences
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="running_experience">Experience Level</Label>
                <Select
                  value={formData.running_experience}
                  onValueChange={(
                    value: "beginner" | "intermediate" | "advanced"
                  ) => setFormData({ ...formData, running_experience: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pace_band">Pace Band</Label>
                <Input
                  id="pace_band"
                  value={formData.pace_band}
                  onChange={(e) =>
                    setFormData({ ...formData, pace_band: e.target.value })
                  }
                  placeholder="5:00-5:30 min/km"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Genres</Label>
              <div className="flex gap-2">
                <Select value={genreInput} onValueChange={addGenre}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select genres" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedGenres.map((genre) => (
                  <Badge key={genre} variant="outline" className="pl-2 pr-1">
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeGenre(genre)}
                      className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {user ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
