-- Enable Row Level Security on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select only their own projects
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects"
ON projects FOR SELECT
USING (auth.uid()::text = user_id);

-- Create policy to allow users to insert their own projects
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
CREATE POLICY "Users can insert their own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Create policy to allow users to update their own projects
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects"
ON projects FOR UPDATE
USING (auth.uid()::text = user_id);

-- Create policy to allow users to delete their own projects
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects"
ON projects FOR DELETE
USING (auth.uid()::text = user_id);

-- Enable Row Level Security on datasets table
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select only datasets from their own projects
DROP POLICY IF EXISTS "Users can view datasets from their projects" ON datasets;
CREATE POLICY "Users can view datasets from their projects"
ON datasets FOR SELECT
USING (
  project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()::text
  )
);

-- Create policy to allow users to insert datasets to their own projects
DROP POLICY IF EXISTS "Users can insert datasets to their projects" ON datasets;
CREATE POLICY "Users can insert datasets to their projects"
ON datasets FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()::text
  )
);

-- Create policy to allow users to update datasets from their own projects
DROP POLICY IF EXISTS "Users can update datasets from their projects" ON datasets;
CREATE POLICY "Users can update datasets from their projects"
ON datasets FOR UPDATE
USING (
  project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()::text
  )
);

-- Create policy to allow users to delete datasets from their own projects
DROP POLICY IF EXISTS "Users can delete datasets from their projects" ON datasets;
CREATE POLICY "Users can delete datasets from their projects"
ON datasets FOR DELETE
USING (
  project_id IN (
    SELECT id FROM projects WHERE user_id = auth.uid()::text
  )
);
