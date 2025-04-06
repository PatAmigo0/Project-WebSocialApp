class WebSocketData {
    static Type = Object.freeze({
        NEW_USER: "new-user",
        REM_USER: "rem-user",
        NEW_CONV: "new-conv",
        NEW_MESS: "new-mess"
    });

    /**
     * 
     * @param {*} type WebSocketData.Type
     * @param {*} data Object
     */
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }

    static fromJsonString(jsonString) {
        const { type, data } = JSON.parse(jsonString);
        return new WebSocketData(type, data);
    }
}

module.exports = WebSocketData;