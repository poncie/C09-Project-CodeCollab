import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import { AuthenticationError } from "apollo-server-errors";
import { isDocument } from "@typegoose/typegoose";

import { File, FileModel } from "../../entities/file.entity";
import { Context } from "../../context";
import { WriteFileInput } from "./input/writeFile.input";

@Resolver()
export class WriteFileResolver {
    @Mutation(() => File, {
        description:
            "unused currently but can be used for extending to other languages",
    })
    @Authorized()
    async writeFile(
        @Arg("file", { description: "file id and content" })
        { fileId, content }: WriteFileInput,
        @Ctx() context: Context
    ) {
        let file = await FileModel.findById(fileId)
            .populate({ path: "project", model: "Project" })
            .exec();

        if (!file) throw new Error(`File with id: ${fileId} does not exist`);

        let userId = context.req.session.userId;

        if (isDocument(file.project)) {
            let isOwner = file.project!.owner!.toString() === userId;
            let isCollaborator = file.project.collaborators.some(
                (collaboratorId: any) => collaboratorId.toString() === userId
            );

            if (!isOwner && !isCollaborator)
                throw new AuthenticationError(
                    `You must be a collaborator or owner of this project to write to this file`
                );
        }

        file.content = content;
        await file.save();

        return file;
    }
}
