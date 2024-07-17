export interface Root {
    icestats: Icestats
  }
  
  export interface Icestats {
    admin: string
    host: string
    location: string
    server_id: string
    server_start: string
    server_start_iso8601: string
    source: Source[] | Source
  }
  
  export interface Source {
    audio_info?: string
    channels?: number
    genre?: string
    listener_peak?: number
    listeners: number
    listenurl: string
    samplerate?: number
    server_description?: string
    server_name?: string
    server_type?: string
    stream_start?: string
    stream_start_iso8601?: string
    title?: string
    dummy: any
  }