import { supabase } from "./supabase";
import { ProjectCardProps } from "@/components/dashboard/ProjectCard";

export interface ProjectCreateData {
  title: string;
  category: string;
  description?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

// Get all projects for the current user
export async function getUserProjects() {
  try {
    // Get current user ID from localStorage or Supabase session
    const userId = localStorage.getItem("userId");

    if (!userId) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("No authenticated user found");
        return [];
      }
    }

    const { data: projects, error } = await supabase
      .from("projects")
      .select(
        `
        id,
        title,
        description,
        category,
        resources,
        flows,
        datasets,
        dashboards,
        created_at,
        updated_at,
        user_id,
        project_team_members(
          team_members(
            id,
            name,
            avatar
          )
        )
      `,
      )
      .eq("user_id", userId) // Filter projects by user_id
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return [];
    }

    if (!projects || projects.length === 0) {
      return [];
    }

    // Transform the data to match ProjectCardProps
    return projects.map((project: any) => {
      // Extract team members from the nested structure
      let teamMembers = [];
      if (
        project.project_team_members &&
        project.project_team_members.length > 0
      ) {
        teamMembers = project.project_team_members
          .filter((ptm: any) => ptm.team_members)
          .map((ptm: any) => ptm.team_members);
      }

      // If no team members, add a default one
      if (teamMembers.length === 0) {
        teamMembers = [
          {
            id: "default-member",
            name: "Demo User",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=default`,
          },
        ];
      }

      // Calculate time difference for "lastUpdated"
      const updatedAt = new Date(project.updated_at || new Date());
      const now = new Date();
      const diffMs = now.getTime() - updatedAt.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      let lastUpdated = "Just now";
      if (diffDays > 0) {
        lastUpdated = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      } else if (diffHours > 0) {
        lastUpdated = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      } else if (diffMinutes > 5) {
        lastUpdated = `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
      }

      return {
        id: project.id,
        title: project.title,
        description: project.description || "No description provided",
        category: project.category,
        resources: project.resources || 0,
        flows: project.flows || 0,
        datasets: project.datasets || 0,
        dashboards: project.dashboards || 0,
        teamMembers,
        lastUpdated,
      } as ProjectCardProps;
    });
  } catch (error) {
    console.error("Error in getUserProjects:", error);
    return [];
  }
}

// Get a single project by ID
export async function getProjectById(id: string) {
  try {
    // Get current user ID from localStorage or Supabase session
    const userId = localStorage.getItem("userId");

    if (!userId) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("No authenticated user found");
        return null;
      }
    }

    const { data: project, error } = await supabase
      .from("projects")
      .select(
        `
        id,
        title,
        description,
        category,
        resources,
        flows,
        datasets,
        dashboards,
        created_at,
        updated_at,
        user_id,
        project_team_members(
          team_members(
            id,
            name,
            avatar
          )
        )
      `,
      )
      .eq("id", id)
      .eq("user_id", userId) // Ensure the project belongs to the current user
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      return null;
    }

    // Extract team members from the nested structure
    let teamMembers = [];
    if (
      project.project_team_members &&
      project.project_team_members.length > 0
    ) {
      teamMembers = project.project_team_members
        .filter((ptm: any) => ptm.team_members)
        .map((ptm: any) => ptm.team_members);
    }

    // If no team members, add a default one
    if (teamMembers.length === 0) {
      teamMembers = [
        {
          id: "default-member",
          name: "Demo User",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=default`,
        },
      ];
    }

    // Calculate time difference for "lastUpdated"
    const updatedAt = new Date(project.updated_at || new Date());
    const now = new Date();
    const diffMs = now.getTime() - updatedAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    let lastUpdated = "Just now";
    if (diffDays > 0) {
      lastUpdated = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      lastUpdated = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffMinutes > 5) {
      lastUpdated = `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    }

    return {
      id: project.id,
      title: project.title,
      description: project.description || "No description provided",
      category: project.category,
      resources: project.resources || 0,
      flows: project.flows || 0,
      datasets: project.datasets || 0,
      dashboards: project.dashboards || 0,
      teamMembers,
      lastUpdated,
    } as ProjectCardProps;
  } catch (error) {
    console.error("Error in getProjectById:", error);
    return null;
  }
}

// Create a new project
export async function createProject(projectData: ProjectCreateData) {
  try {
    // Get the current user ID from Supabase session or localStorage
    let userId = localStorage.getItem("userId");

    if (!userId) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        userId = sessionData.session.user.id;
      } else {
        // Fallback for demo purposes
        const userEmail =
          localStorage.getItem("userEmail") || "demo@example.com";
        userId = "demo-user-" + userEmail.split("@")[0];
      }
    }

    console.log("Creating project with data:", {
      ...projectData,
      user_id: userId,
    });

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        title: projectData.title,
        description:
          projectData.description ||
          `This is a new ${projectData.category.toLowerCase()} project.`,
        category: projectData.category,
        user_id: userId,
        resources: 0,
        flows: 0,
        datasets: 0,
        dashboards: 0,
      })
      .select();

    if (projectError) {
      console.error("Error creating project:", projectError);
      return null;
    }

    if (!project || project.length === 0) {
      console.error("No project returned after insert");
      return null;
    }

    const createdProject = project[0];
    console.log("Project created successfully:", createdProject);

    // Create a default team member
    const defaultMember = {
      name: localStorage.getItem("userEmail")?.split("@")[0] || "User",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    };

    console.log("Creating team member:", defaultMember);

    // Create the team member
    const { data: teamMember, error: teamMemberError } = await supabase
      .from("team_members")
      .insert(defaultMember)
      .select();

    if (teamMemberError) {
      console.error("Error creating team member:", teamMemberError);
      // Continue anyway, the project was created
    } else if (teamMember && teamMember.length > 0) {
      const createdMember = teamMember[0];
      console.log("Team member created successfully:", createdMember);

      // Link the team member to the project
      const linkData = {
        project_id: createdProject.id,
        team_member_id: createdMember.id,
      };
      console.log("Linking team member to project:", linkData);

      const { error: linkError } = await supabase
        .from("project_team_members")
        .insert(linkData);

      if (linkError) {
        console.error("Error linking team member to project:", linkError);
        // Continue anyway, the project was created
      } else {
        console.log("Team member linked to project successfully");
      }

      return {
        id: createdProject.id,
        title: createdProject.title,
        description: createdProject.description || "No description provided",
        category: createdProject.category,
        resources: createdProject.resources || 0,
        flows: createdProject.flows || 0,
        datasets: createdProject.datasets || 0,
        dashboards: createdProject.dashboards || 0,
        teamMembers: [
          {
            id: createdMember.id,
            name: createdMember.name,
            avatar: createdMember.avatar,
          },
        ],
        lastUpdated: "Just now",
      } as ProjectCardProps;
    }

    // If we couldn't create or link a team member, return the project with an empty team
    return {
      id: createdProject.id,
      title: createdProject.title,
      description: createdProject.description || "No description provided",
      category: createdProject.category,
      resources: createdProject.resources || 0,
      flows: createdProject.flows || 0,
      datasets: createdProject.datasets || 0,
      dashboards: createdProject.dashboards || 0,
      teamMembers: [
        {
          id: "default-member",
          name: "Demo User",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=default`,
        },
      ],
      lastUpdated: "Just now",
    } as ProjectCardProps;
  } catch (error) {
    console.error("Error in createProject:", error);
    return null;
  }
}

// Update a project
export async function updateProject(
  id: string,
  projectData: Partial<ProjectCreateData>,
) {
  const { data: project, error } = await supabase
    .from("projects")
    .update(projectData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating project:", error);
    return null;
  }

  return project;
}

// Delete a project
export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("Error deleting project:", error);
    return false;
  }

  return true;
}
