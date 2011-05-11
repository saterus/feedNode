%w(curb uri json).each{|lib| require lib}

class FeedNodeClient
  def initialize(server,app_token)
    @server = "http://#{server}/"
    @target = "#{@server}#{app_token}/"
  end

  def send_msg(msg)
    res = Curl::Easy.http_post(URI.escape(@target + msg))
    throw Exception.new("There was a problem - make sure your token is correct") unless res.response_code == 200
  end

  def queue_check()
    res = Curl::Easy.http_get(@server + 'queue_check')
    throw Exception.new("There was a problem - Couldn't check the queues.") unless res.response_code == 200
    JSON.parse(res.body_str)
  end
end
