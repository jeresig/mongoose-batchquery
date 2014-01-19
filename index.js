var async = require("async");
var events = require("events");

module.exports = function batchQuery(schema, options) {
    schema.statics = {
        batchQuery: function(query, batchSize, callback) {
            var self = this;
            var pos = 0;
            var emit = new events.EventEmitter();

            this.count(query, function(err, count) {
                async.whilst(
                    function() {
                        return pos < count;
                    },

                    function(next) {
                        self.find(query)
                            .limit(batchSize).skip(pos)
                            .exec(function(err, images) {
                                pos += batchSize;

                                if (err) {
                                    emit.trigger("error", err);
                                } else {
                                    emit.trigger("data", {
                                        from: pos,
                                        to: pos + batchSize - 1,
                                        images: images
                                    });
                                }

                                next();
                            });
                    },

                    function(err) {
                        emit.trigger("close");
                    }
                );
            });

            return emit;
        }
    };
};