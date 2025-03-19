import { supabase } from "./supabase";

export interface Dataset {
  id: string;
  name: string;
  description: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatasetCreateData {
  name: string;
  description?: string;
  project_id: string;
}

export interface DatasetUpdateData {
  name?: string;
  description?: string;
}

// Get all datasets for a project
export async function getProjectDatasets(projectId: string) {
  try {
    const { data, error } = await supabase
      .from("datasets")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching datasets:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getProjectDatasets:", error);
    return [];
  }
}

// Create a new dataset
export async function createDataset(datasetData: DatasetCreateData) {
  try {
    console.log("Creating dataset with data:", datasetData);

    const { data, error } = await supabase
      .from("datasets")
      .insert({
        name: datasetData.name,
        description: datasetData.description || "",
        project_id: datasetData.project_id,
      })
      .select();

    if (error) {
      console.error("Error creating dataset:", error);
      return null;
    }

    if (!data || data.length === 0) {
      console.error("No dataset returned after insert");
      return null;
    }

    console.log("Dataset created successfully:", data[0]);
    return data[0] as Dataset;
  } catch (error) {
    console.error("Error in createDataset:", error);
    return null;
  }
}

// Update a dataset
export async function updateDataset(id: string, updateData: DatasetUpdateData) {
  try {
    const { data, error } = await supabase
      .from("datasets")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating dataset:", error);
      return null;
    }

    if (!data || data.length === 0) {
      console.error("No dataset returned after update");
      return null;
    }

    console.log("Dataset updated successfully:", data[0]);
    return data[0] as Dataset;
  } catch (error) {
    console.error("Error in updateDataset:", error);
    return null;
  }
}

// Delete a dataset
export async function deleteDataset(id: string) {
  try {
    const { error } = await supabase.from("datasets").delete().eq("id", id);

    if (error) {
      console.error("Error deleting dataset:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteDataset:", error);
    return false;
  }
}
