import { gql } from "@apollo/client";

const projectOperations = {
    getUserProjects: gql`
        query getUserProjects {
            getCurrentUser {
                sharedProjects {
                    _id
                    name
                }
                createdProjects {
                    _id
                    name
                }
            }
        }
    `,
    getCurrentUser: gql`
        query getCurrentUser {
            getCurrentUser {
                _id
                email
            }
        }
    `,
    createProject: gql`
        mutation createProject($name: String!) {
            createProject(project: { name: $name }) {
                _id
            }
        }
    `,
    getProjectById: gql`
        query getProjectById($id: String!) {
            getProjectById(id: $id) {
                _id
                name
                html
                css
                js
                owner {
                    _id
                    email
                }
            }
        }
    `,
    addCollaborator: gql`
        mutation addCollaborator($email: String!, $projectId: String!) {
            addCollaborator(
                project: { collaboratorEmail: $email, projectId: $projectId }
            ) {
                _id
                name
            }
        }
    `,
    getProjectRoles: gql`
        query getProjectRoles($projectId: String!) {
            getProjectRoles(projectId: $projectId) {
                isOwner
                isCollaborator
            }
        }
    `,
};

export default projectOperations;
