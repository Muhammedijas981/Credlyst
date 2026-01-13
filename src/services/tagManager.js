class TagManager {
    async getAllTags() { return []; }
    async addTag(name, color) { return null; }
    async deleteTag(id) { return true; }
}
export default new TagManager();
