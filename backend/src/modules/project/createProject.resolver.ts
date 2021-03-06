import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import { isDocumentArray } from "@typegoose/typegoose";
import { Types } from "mongoose";
import Validator from "validator";

import { Context } from "../../context";
import { Project, ProjectModel } from "../../entities/project.entity";
import { CreateProjectInput } from "./input/createProject.input";
import { UserModel } from "../../entities/user.entity";

@Resolver()
export class CreateProjectResolver {
    @Mutation(() => Project, {
        description: "Mutation for creating project",
    })
    @Authorized()
    async createProject(
        @Arg("project", {
            description: "Name of new project",
        })
        { name }: CreateProjectInput,
        @Ctx() context: Context
    ): Promise<Project> {
        // Sanitize the name input
        name = Validator.trim(name);
        name = Validator.escape(name);

        // Check if user exists
        let user = await UserModel.findById(context.req.session.userId)
            .populate({ path: "createdProjects", model: "Project" })
            .exec();

        if (!user)
            throw new Error(
                `User ID ${context.req.session.userId} does not exist`
            );

        if (isDocumentArray(user.createdProjects)) {
            let projectNameExists = user.createdProjects.some(
                (project) => project.name === name
            );

            if (projectNameExists)
                throw new Error(
                    `You already have a project with name: ${name}`
                );
        }

        // Create new project
        let project = new ProjectModel({
            name,
            owner: user,
            html: Types.ObjectId(),
            css: Types.ObjectId(),
            js: Types.ObjectId(),
        });

        // Add the newly created project to the user
        user.createdProjects.push(project._id);

        // Save it all to the database
        await Promise.all([project.save(), user.save()]);

        return project;
    }
}
