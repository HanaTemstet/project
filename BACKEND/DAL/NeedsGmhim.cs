//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace DAL
{
    using System;
    using System.Collections.Generic;
    
    public partial class NeedsGmhim
    {
        public int ID { get; set; }
        public int CATEGORY { get; set; }
        public string ADRESS { get; set; }
    
        public virtual CategoryGMH CategoryGMH { get; set; }
    }
}