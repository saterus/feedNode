(function(exports){

  var Q = function(max_size) {

    this.front = null;
    this.end = null;
    this.size = 0;
    this.max_size = max_size;

    this.push = function(e) {
      if(this.end) {
        this.end.next = new Node(e, null);
        this.end = this.end.next;
      } else {
        this.end = new Node(e, null);
      }

      if(this.front === null) {
        this.front = this.end;
      }

      if(this.size >= this.max_size) {
        this.front = this.front.next;
      } else {
        this.size++;
      }


    };

    this.pop = function() {
      if(this.front) {
        var element = this.front.element;
        this.front = this.front.next;
        this.size--;

        return element;

      } else {
        return null;
      }
    };

    this.peek = function() {
      if(this.front) {
        return this.front.element;
      } else {
        return null;
      }
    }

    this.forEach = function(f) {
      var cursor = this.front;
      while(cursor) {
        f(cursor.element);
        cursor = cursor.next;
      }
    };

  };

  var coerceToQueue = function(otherQ) {
    var q = new Q(otherQ.max_size);
    q.size = otherQ.size;
    q.front = otherQ.front;
    q.end = otherQ.end;

    return q;
  };

  var Node = function(element, next) {
    this.element = element;
    this.next = next;
  };


  exports.Q = Q;
  exports.coerceToQueue = coerceToQueue;

})(typeof exports === 'undefined'? this['Queue']={}: exports);
