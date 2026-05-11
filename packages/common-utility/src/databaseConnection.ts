import sql from "mssql/msnodesqlv8";

export interface MSSQLConfig {
    server: string;
    database: string;
    authentication?: {
        type: "default" | "ntlm";
        options?: {
            userName?: string;
            password?: string;
            domain?: string;
        };
    };
    options?: {
        encrypt?: boolean;
        trustServerCertificate?: boolean;
        enableKeepAlive?: boolean;
        connectionTimeout?: number;
        requestTimeout?: number;
    };
}

export class DatabaseConnection {
    private config: sql.config;
    public static connection: sql.ConnectionPool | null = null;

    constructor(serverName: string, databaseName: string) {
        this.config = this.buildPoolConfig(serverName, databaseName);
    }

    public async OpenConnection(){
        try {
            // let connection: sql.ConnectionPool
            // DatabaseConnection.connection = new sql.ConnectionPool(this.config);
            DatabaseConnection.connection = await sql.connect(this.config);
            console.log(`MSSQL Connection opened to ${this.config.server}/${this.config.database}`);
            return DatabaseConnection.connection;
        } catch (error) {
            console.log(JSON.stringify(error, null, 2));
            console.error("Failed to open MSSQL connection:", error);
            throw error;
        }
    }

    public async CloseConnection(): Promise<void> {
        try {
            if (DatabaseConnection.connection) {
                await DatabaseConnection.connection.close();
                console.log("MSSQL Connection closed");
            }
        } catch (error) {
            console.error("Failed to close MSSQL connection:", error);
            throw error;
        }
    }

    public GetConnection(): sql.ConnectionPool | null {
        return DatabaseConnection.connection;
    }

    public buildPoolConfig(serverName: string, databaseName: string): sql.config {
        return {
            server: serverName,
            database: databaseName,
            driver: "ODBC Driver 17 for SQL Server",
            options: {
                trustedConnection: true,
                trustServerCertificate: true,
            },
        };
    }
}